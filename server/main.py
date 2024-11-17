import random
import threading
import time
import uuid
from io import BytesIO
from pathlib import Path
import requests
import base64
import json
from PIL import Image
from diffusers.utils import export_to_video
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import torch
import os
import subprocess
from diffusers import DiffusionPipeline, DPMSolverMultistepScheduler

# load env variables
load_dotenv('../.env')
# initialize Flask app
app = Flask(__name__, static_folder='./output')
CORS(app)

art = """
Pleisiosaur
                 _..--+~/@-~--.
             _-=~      (  .   "}
          _-~     _.--=.\\ \"\"\"\"
        _~      _-       \\ \\_\
       =      _=          '--'
      '      =                             .
     :      :       ____                   '=_. ___
___  |      ;                            ____ '~--.~.
     ;      ;                               _____  } |
  ___=       \\ ___ __     __..-...__           ___/__/__
     :        =_     _.-~~          ~~--.__
_____ \\         ~-+-~                   ___~=_______
     ~@#~~ == ...______ __ ___ _--~~--_
"""
print("--> Starting the backend server. This may take some time.\n" + art)

# check for CUDA enabled GPU
cudaGPU = torch.cuda.is_available()
print("CUDA-enabled gpu detected: " + str(cudaGPU))
if cudaGPU:
    device = torch.device('cuda:0')
else:
    device = torch.device('cpu')

# load model pipelines

if os.getenv("STABLE_DIFFUSION_2") == 'true':
    print("Loading Stable Diffusion 2 base model")
    pipe = DiffusionPipeline.from_pretrained("stabilityai/stable-diffusion-2-base", torch_dtype=torch.float16, revision="fp16")
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    pipe = pipe.to(device)

if (os.getenv("REALISTIC_VISION")) == 'true':
    print("Loading Realistic Vision 2.0 model")
    realistic_vision_pipe = DiffusionPipeline.from_pretrained('SG161222/Realistic_Vision_V2.0',
                                                                  torch_dtype=torch.float16,
                                                                  )
    realistic_vision_pipe.scheduler = DPMSolverMultistepScheduler.from_config(realistic_vision_pipe.scheduler.config)
    realistic_vision_pipe = realistic_vision_pipe.to(device)
    realistic_vision_pipe.enable_model_cpu_offload()
    realistic_vision_pipe.enable_vae_slicing()

if (os.getenv("OPENJOURNEY")) == 'true':
    print("Loading openjourney model")
    openjourney_pipe = DiffusionPipeline.from_pretrained('prompthero/openjourney',
                                                         torch_dtype=torch.float16,
                                                         )
    openjourney_pipe.scheduler = DPMSolverMultistepScheduler.from_config(openjourney_pipe.scheduler.config)
    openjourney_pipe = openjourney_pipe.to(device)
    openjourney_pipe.enable_model_cpu_offload()
    openjourney_pipe.enable_vae_slicing()

if (os.getenv("DREAM_SHAPER")) == 'true':
    print("Loading Dream Shaper model")
    dream_shaper_pipe = DiffusionPipeline.from_pretrained('Lykon/DreamShaper',
                                                          torch_dtype=torch.float16,
                                                          )
    dream_shaper_pipe.scheduler = DPMSolverMultistepScheduler.from_config(dream_shaper_pipe.scheduler.config)
    dream_shaper_pipe = dream_shaper_pipe.to(device)
    dream_shaper_pipe.enable_model_cpu_offload()
    dream_shaper_pipe.enable_vae_slicing()

if (os.getenv("DREAMLIKE_PHOTOREAL")) == 'true':
    print("Loading Dreamlike Photoreal model")
    dreamlike_photoreal_pipe = DiffusionPipeline.from_pretrained('dreamlike-art/dreamlike-photoreal-2.0',
                                                                 torch_dtype=torch.float16,
                                                                 )
    dreamlike_photoreal_pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        dreamlike_photoreal_pipe.scheduler.config)
    dreamlike_photoreal_pipe = dreamlike_photoreal_pipe.to(device)
    dreamlike_photoreal_pipe.enable_model_cpu_offload()
    dreamlike_photoreal_pipe.enable_vae_slicing()

if (os.getenv("VOX2")) == 'true':
    print("Loading vox2 model")
    vox2_pipe = DiffusionPipeline.from_pretrained('plasmo/vox2',
                                                  torch_dtype=torch.float16,
                                                  )
    vox2_pipe.scheduler = DPMSolverMultistepScheduler.from_config(vox2_pipe.scheduler.config)
    vox2_pipe = vox2_pipe.to(device)
    vox2_pipe.enable_model_cpu_offload()
    vox2_pipe.enable_vae_slicing()

# imgur upload config
CLIENT_ID = os.getenv("IMGUR_CLIENT_ID")
imgur_url = "https://api.imgur.com/3/image"
headers = {"Authorization": "Client-ID " + CLIENT_ID}

# initialize process lock
processing_lock = threading.Lock()

# initialize other variables
OUTPUT_DIR = os.getenv("OUTPUT_DIR")

# process can take an image url; in the future some models may require uploading an image
def process(prompt: str, pipeline: str, num: int, img_url: str):
    start_time = time.time()
    print("Processing query...")
    print(prompt)
    seed = random.randint(0, 100000)
    if torch.cuda.is_available():
        generator = torch.Generator(device=device).manual_seed(seed)
    else:
        generator = None
    process_output = []
    match pipeline:
        case "StableDiffusion":
            images_array = pipe(
                prompt=prompt,
                negative_prompt=os.getenv("NEGATIVE_PROMPT"),
                num_images_per_prompt=num,
                num_inference_steps=int(os.getenv("SD_IMAGE_INFERENCE_STEPS")),
                guidance_scale=float(os.getenv("SD_IMAGE_GUIDANCE_SCALE")),
                width=int(os.getenv("SD_IMAGE_WIDTH")),
                height=int(os.getenv("SD_IMAGE_HEIGHT")),
                generator=generator,
            ).images
            Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
            for index in range(num):
                image_path = save_and_upload(images_array[index])
                process_output.append(image_path)
        case "RealisticVision":
            images_array = realistic_vision_pipe(
                prompt=prompt + "(high detailed skin:1.2), 8k uhd, dslr, soft lighting, high quality, film grain, " "Fujifilm XT3",
                negative_prompt=os.getenv("NEGATIVE_PROMPT"),
                num_images_per_prompt=num,
                num_inference_steps=int(os.getenv("RV_INFERENCE_STEPS")),
                guidance_scale=float(os.getenv("RV_GUIDANCE_SCALE")),
                width=int(os.getenv("RV_IMAGE_WIDTH")),
                height=int(os.getenv("RV_IMAGE_HEIGHT")),
                generator=generator,
            ).images
            Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
            for index in range(num):
                image_path = save_and_upload(images_array[index])
                process_output.append(image_path)
        case "Openjourney":
            images_array = openjourney_pipe(
                prompt="mdjrny-v4 style " + prompt,
                negative_prompt=os.getenv("NEGATIVE_PROMPT"),
                num_images_per_prompt=num,
                num_inference_steps=int(os.getenv("OJ_INFERENCE_STEPS")),
                guidance_scale=float(os.getenv("OJ_GUIDANCE_SCALE")),
                width=int(os.getenv("OJ_IMAGE_WIDTH")),
                height=int(os.getenv("OJ_IMAGE_HEIGHT")),
                generator=generator,
            ).images
            Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
            for index in range(num):
                image_path = save_and_upload(images_array[index])
                process_output.append(image_path)
        case "DreamShaper":
            images_array = dream_shaper_pipe(
                prompt=prompt,
                negative_prompt=os.getenv("NEGATIVE_PROMPT"),
                num_images_per_prompt=num,
                num_inference_steps=int(os.getenv("DS_INFERENCE_STEPS")),
                guidance_scale=float(os.getenv("DS_GUIDANCE_SCALE")),
                width=int(os.getenv("DS_IMAGE_WIDTH")),
                height=int(os.getenv("DS_IMAGE_HEIGHT")),
                generator=generator,
            ).images
            Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
            for index in range(num):
                image_path = save_and_upload(images_array[index])
                process_output.append(image_path)
        case "DreamlikePhotoreal":
            images_array = dreamlike_photoreal_pipe(
                prompt=prompt,
                negative_prompt=os.getenv("NEGATIVE_PROMPT"),
                num_images_per_prompt=num,
                num_inference_steps=int(os.getenv("PR_INFERENCE_STEPS")),
                guidance_scale=float(os.getenv("PR_GUIDANCE_SCALE")),
                width=int(os.getenv("PR_IMAGE_WIDTH")),
                height=int(os.getenv("PR_IMAGE_HEIGHT")),
                generator=generator,
            ).images
            Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
            for index in range(num):
                image_path = save_and_upload(images_array[index])
                process_output.append(image_path)
        case "vox2":
            images_array = vox2_pipe(
                prompt="voxel-ish, intricate detail: " + prompt,
                negative_prompt=os.getenv("NEGATIVE_PROMPT"),
                num_images_per_prompt=num,
                num_inference_steps=int(os.getenv("VOX2_INFERENCE_STEPS")),
                guidance_scale=float(os.getenv("VOX2_GUIDANCE_SCALE")),
                width=int(os.getenv("VOX2_IMAGE_WIDTH")),
                height=int(os.getenv("VOX2_IMAGE_HEIGHT")),
                generator=generator,
            ).images
            Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
            for index in range(num):
                image_path = save_and_upload(images_array[index])
                process_output.append(image_path)

    gen_time = time.time() - start_time
    print(f"Created generation in {gen_time} seconds")
    return process_output

# API for javascript
@app.route("/process", methods=["POST"])
def process_api():
    json_data = request.get_json(force=True)
    text_prompt = json_data["prompt"]
    pipeline = json_data["pipeline"]
    num = int(json_data["numImages"])
    image_url = json_data["imgUrl"]
    with processing_lock:
        generation = process(text_prompt, pipeline, num, image_url)
    response = {'generation': generation}
    return jsonify(response)

def save_and_upload(image):
    file_name = str(uuid.uuid4()) + '.png'
    image_path = os.path.join(OUTPUT_DIR, file_name)
    image.save(image_path, format='png')
    image_url = upload_image(image_path)
    return image_url

def upload_image(image):
    with open(image, "rb") as file:
        data = file.read()
        base64_data = base64.b64encode(data)
    response = requests.post(imgur_url, headers=headers, data={"image": base64_data})
    url = response.json()["data"]["link"]
    if os.path.exists(image):
      os.remove(image)
    else:
      print("The file does not exist")
    return url

if __name__ == "__main__":
    app.run(host=os.getenv("BACKEND_ADDRESS"), port=int(os.getenv("PORT")), debug=False)

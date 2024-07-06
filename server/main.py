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


print("--> Starting the backend server. This may take some time.")

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

if os.getenv("TEXT_TO_VIDEO") == 'true':
    print("Loading Modelscope Text-to-Video model")
    text_to_video_pipe = DiffusionPipeline.from_pretrained('damo-vilab/text-to-video-ms-1.7b', torch_dtype=torch.float16, variant='fp16')
    text_to_video_pipe.scheduler = DPMSolverMultistepScheduler.from_config(text_to_video_pipe.scheduler.config)
    text_to_video_pipe = text_to_video_pipe.to(device)
    text_to_video_pipe.enable_model_cpu_offload()
    text_to_video_pipe.enable_vae_slicing()

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
        case "TextToVideo":
            video_frames = text_to_video_pipe(
                prompt=prompt,
                negative_prompt=os.getenv("NEGATIVE_PROMPT"),
                num_frames=int(os.getenv("VIDEO_NUM_FRAMES")),
                num_inference_steps=int(os.getenv("VIDEO_INFERENCE_STEPS")),
                guidance_scale=float(os.getenv("VIDEO_GUIDANCE_SCALE")),
                width=256,
                height=256,
                generator=generator,
            ).frames
            gif_file_path = save_frames_and_upload(video_frames)
            process_output.append(gif_file_path)
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

def save_frames_and_upload(video_frames):
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    file_name = str(uuid.uuid4()) + '.mp4'
    mp4_file_path = os.path.join(OUTPUT_DIR, file_name)
    export_to_video(video_frames, mp4_file_path)
    gif_file_path = convert_to_gif(mp4_file_path)
    os.remove(mp4_file_path)
    image_url = upload_image(gif_file_path)
    return image_url

def convert_to_gif(mp4_file_path):
    gif_file_path = mp4_file_path[:-4] + ".gif"
    subprocess.run(['ffmpeg', '-i', mp4_file_path, '-vf', 'fps=10,scale=320:-1:flags=lanczos', gif_file_path],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return gif_file_path

if __name__ == "__main__":
    app.run(host=os.getenv("BACKEND_ADDRESS"), port=int(os.getenv("PORT")), debug=False)

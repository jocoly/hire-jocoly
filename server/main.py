import random
import subprocess
import threading
import time
import uuid
from io import BytesIO
from pathlib import Path
import requests
import urllib
import base64
import json
from PIL import Image
from diffusers.utils import export_to_video
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import torch
import os
from datasets import load_dataset
from diffusers import DiffusionPipeline, DPMSolverMultistepScheduler


load_dotenv('../.env')
app = Flask(__name__, static_folder='./output')
CORS(app)
print("--> Starting the backend server. This may take some time.")

print("CUDA-enabled gpu detected: " + str(torch.cuda.is_available()))
if torch.cuda.is_available():
    device = torch.device('cuda:0')
else:
    device = torch.device('cpu')

print("Loading Stable Diffusion 2 base model")
pipe = DiffusionPipeline.from_pretrained("stabilityai/stable-diffusion-2-base", torch_dtype=torch.float16, revision="fp16")
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
pipe = pipe.to("cuda")

CLIENT_ID = os.getenv("IMGUR_CLIENT_ID")
imgur_url = "https://api.imgur.com/3/image"
headers = {"Authorization": "Client-ID " + CLIENT_ID}

processing_lock = threading.Lock()


def process(prompt: str, pipeline: str, num: int, img_url: str):
    start_time = time.time()
    print("Processing query...")
    print(prompt)
    seed = random.randint(0, 100000)
    if torch.cuda.is_available():
        generator = torch.Generator(device=device).manual_seed(seed)
    else:
        generator = None
    output_dir = os.getenv("OUTPUT_DIR")
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
            Path(output_dir).mkdir(parents=True, exist_ok=True)
            for index in range(num):
                image_path = save_image(images_array[index], output_dir)
                process_output.append(image_path)
    gen_time = time.time() - start_time
    print(f"Created generation in {gen_time} seconds")
    return process_output

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

def save_image(image, output_dir):
    file_name = str(uuid.uuid4()) + '.png'
    image_path = os.path.join(output_dir, file_name)
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
    app.run(host=os.getenv("BACKEND_ADDRESS"), port=os.getenv("PORT"), debug=False)

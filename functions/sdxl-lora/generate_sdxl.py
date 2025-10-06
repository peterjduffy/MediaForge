#!/usr/bin/env python3
"""
SDXL + LoRA generation script for MediaForge
Optimized for Cloud Run with scale-to-zero
"""

import argparse
import torch
from diffusers import DiffusionPipeline, StableDiffusionXLPipeline
from diffusers import DPMSolverMultistepScheduler
import os
import gc
from pathlib import Path
from google.cloud import storage
import time

# Configure for optimal memory usage
torch.cuda.empty_cache()
torch.backends.cudnn.benchmark = True

# Cache directory for models
CACHE_DIR = "/tmp/model_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

def download_lora_weights(lora_path):
    """Download LoRA weights from Cloud Storage if not cached"""
    if not lora_path:
        return None

    # Parse GCS path: gs://bucket/path/to/model.safetensors
    if lora_path.startswith("gs://"):
        parts = lora_path.replace("gs://", "").split("/", 1)
        bucket_name = parts[0]
        blob_path = parts[1] if len(parts) > 1 else ""

        local_path = os.path.join(CACHE_DIR, "lora", blob_path)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)

        # Check if already downloaded
        if not os.path.exists(local_path):
            print(f"Downloading LoRA weights from {lora_path}")
            client = storage.Client()
            bucket = client.bucket(bucket_name)
            blob = bucket.blob(blob_path)
            blob.download_to_filename(local_path)
            print(f"LoRA weights downloaded to {local_path}")
        else:
            print(f"Using cached LoRA weights from {local_path}")

        return local_path

    return lora_path

def generate_image(prompt, lora_path=None, output_path="output.png", width=1024, height=1024):
    """Generate image using SDXL with optional LoRA"""

    print(f"Starting generation: {width}x{height}")
    print(f"Prompt: {prompt}")

    start_time = time.time()

    # Load base SDXL model
    print("Loading SDXL base model...")
    model_id = "stabilityai/stable-diffusion-xl-base-1.0"

    # Use cached model if available
    local_model_path = os.path.join(CACHE_DIR, "sdxl-base")

    if os.path.exists(local_model_path):
        print("Loading SDXL from cache...")
        pipe = StableDiffusionXLPipeline.from_pretrained(
            local_model_path,
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16",
            local_files_only=True
        )
    else:
        print("Downloading SDXL model (first run only)...")
        pipe = StableDiffusionXLPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16",
            cache_dir=CACHE_DIR
        )
        # Save for next time
        pipe.save_pretrained(local_model_path)

    # Move to GPU
    pipe = pipe.to("cuda")

    # Optimize with scheduler
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        pipe.scheduler.config,
        use_karras_sigmas=True
    )

    # Enable memory efficient attention
    pipe.enable_xformers_memory_efficient_attention()
    pipe.enable_vae_slicing()
    pipe.enable_vae_tiling()

    # Load LoRA weights if provided
    if lora_path:
        local_lora = download_lora_weights(lora_path)
        if local_lora and os.path.exists(local_lora):
            print(f"Loading LoRA weights from {local_lora}")
            pipe.load_lora_weights(local_lora)
            pipe.fuse_lora(lora_scale=0.8)  # Adjust strength as needed
        else:
            print(f"Warning: LoRA weights not found at {local_lora}")

    print(f"Model loaded in {time.time() - start_time:.2f} seconds")

    # Generate image
    print("Generating image...")
    gen_start = time.time()

    generator = torch.Generator(device="cuda").manual_seed(42)

    image = pipe(
        prompt=prompt,
        height=height,
        width=width,
        num_inference_steps=25,  # Reduced for speed
        guidance_scale=7.5,
        generator=generator
    ).images[0]

    print(f"Image generated in {time.time() - gen_start:.2f} seconds")

    # Save image
    image.save(output_path, "PNG")
    print(f"Image saved to {output_path}")

    # Clean up memory
    del pipe
    torch.cuda.empty_cache()
    gc.collect()

    print(f"Total time: {time.time() - start_time:.2f} seconds")

    return output_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate image with SDXL + LoRA")
    parser.add_argument("--prompt", required=True, help="Text prompt for generation")
    parser.add_argument("--lora_path", default="", help="Path to LoRA weights (GCS or local)")
    parser.add_argument("--output", default="output.png", help="Output path for generated image")
    parser.add_argument("--width", type=int, default=1024, help="Image width")
    parser.add_argument("--height", type=int, default=1024, help="Image height")

    args = parser.parse_args()

    generate_image(
        prompt=args.prompt,
        lora_path=args.lora_path,
        output_path=args.output,
        width=args.width,
        height=args.height
    )
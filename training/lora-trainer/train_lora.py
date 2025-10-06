#!/usr/bin/env python3
"""
LoRA training script for MediaForge brand styles
Runs on Vertex AI Training with GPU
"""

import argparse
import os
import torch
from diffusers import StableDiffusionXLPipeline, UNet2DConditionModel
from peft import LoraConfig, get_peft_model, TaskType, PeftModel
from google.cloud import storage
from PIL import Image
import json
from pathlib import Path
from transformers import CLIPTextModel, CLIPTextModelWithProjection
from accelerate import Accelerator
import numpy as np
from tqdm import tqdm

def parse_args():
    parser = argparse.ArgumentParser(description="Train LoRA for brand style")
    parser.add_argument("--brand_id", type=str, required=True)
    parser.add_argument("--brand_name", type=str, required=True)
    parser.add_argument("--input_bucket", type=str, required=True)
    parser.add_argument("--input_path", type=str, required=True)
    parser.add_argument("--output_bucket", type=str, required=True)
    parser.add_argument("--output_path", type=str, required=True)
    parser.add_argument("--num_images", type=int, default=20)
    parser.add_argument("--max_train_steps", type=int, default=500)
    parser.add_argument("--learning_rate", type=float, default=1e-4)
    parser.add_argument("--rank", type=int, default=16, help="LoRA rank")
    parser.add_argument("--batch_size", type=int, default=1)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=4)
    parser.add_argument("--mixed_precision", type=str, default="fp16")
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()

def download_training_images(bucket_name, path_prefix, local_dir="/tmp/training_images"):
    """Download training images from Cloud Storage"""
    os.makedirs(local_dir, exist_ok=True)

    client = storage.Client()
    bucket = client.bucket(bucket_name)

    image_paths = []
    blobs = bucket.list_blobs(prefix=path_prefix)

    print(f"Downloading training images from gs://{bucket_name}/{path_prefix}")

    for blob in blobs:
        if blob.name.lower().endswith(('.jpg', '.jpeg', '.png')):
            local_path = os.path.join(local_dir, os.path.basename(blob.name))
            blob.download_to_filename(local_path)
            image_paths.append(local_path)
            print(f"Downloaded: {blob.name}")

    return image_paths

def prepare_dataset(image_paths, size=1024):
    """Prepare and preprocess training images"""
    dataset = []

    for img_path in image_paths:
        try:
            img = Image.open(img_path).convert("RGB")
            # Resize to training size
            img = img.resize((size, size), Image.Resampling.LANCZOS)
            # Convert to tensor
            img_tensor = torch.from_numpy(np.array(img)).float() / 127.5 - 1.0
            img_tensor = img_tensor.permute(2, 0, 1)
            dataset.append(img_tensor)
        except Exception as e:
            print(f"Error processing {img_path}: {e}")

    return torch.stack(dataset)

def setup_lora_model(model_id="stabilityai/stable-diffusion-xl-base-1.0", rank=16):
    """Setup SDXL with LoRA configuration"""

    print("Loading SDXL base model...")
    pipe = StableDiffusionXLPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        use_safetensors=True,
        variant="fp16"
    )

    # Configure LoRA for UNet
    unet = pipe.unet

    # LoRA configuration
    lora_config = LoraConfig(
        r=rank,
        lora_alpha=rank,
        target_modules=[
            "to_k", "to_q", "to_v", "to_out.0",
            "add_k_proj", "add_v_proj"
        ],
        lora_dropout=0.1,
    )

    # Apply LoRA to UNet
    unet = get_peft_model(unet, lora_config)

    print(f"LoRA model configured with rank {rank}")
    print(f"Trainable parameters: {unet.num_parameters(only_trainable=True):,}")

    return pipe, unet

def train_lora(args):
    """Main training function"""

    # Set random seed
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    # Initialize accelerator for distributed training
    accelerator = Accelerator(
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        mixed_precision=args.mixed_precision
    )

    # Download training images
    image_paths = download_training_images(
        args.input_bucket,
        args.input_path
    )

    if len(image_paths) < 10:
        raise ValueError(f"Not enough training images. Found {len(image_paths)}, need at least 10.")

    print(f"Found {len(image_paths)} training images")

    # Prepare dataset
    dataset = prepare_dataset(image_paths)

    # Setup model
    pipe, unet = setup_lora_model(rank=args.rank)

    # Move to device
    device = accelerator.device
    unet = unet.to(device)
    vae = pipe.vae.to(device)
    text_encoder = pipe.text_encoder.to(device)
    text_encoder_2 = pipe.text_encoder_2.to(device)

    # Setup optimizer
    optimizer = torch.optim.AdamW(
        unet.parameters(),
        lr=args.learning_rate,
        betas=(0.9, 0.999),
        weight_decay=1e-2,
        eps=1e-8
    )

    # Prepare for training
    unet, optimizer = accelerator.prepare(unet, optimizer)

    # Training loop
    print(f"Starting training for {args.max_train_steps} steps...")
    progress_bar = tqdm(range(args.max_train_steps), desc="Training")

    unet.train()

    for step in progress_bar:
        # Get batch of images
        batch_idx = step % len(dataset)
        batch = dataset[batch_idx:batch_idx+1].to(device)

        # Encode images to latents
        with torch.no_grad():
            latents = vae.encode(batch).latent_dist.sample()
            latents = latents * vae.config.scaling_factor

        # Add noise
        noise = torch.randn_like(latents)
        timesteps = torch.randint(0, 1000, (1,), device=device)
        noisy_latents = noise * timesteps / 1000 + latents * (1 - timesteps / 1000)

        # Get text embeddings (using brand name as caption)
        caption = f"A {args.brand_name} style illustration"
        text_inputs = pipe.tokenizer(
            caption,
            padding="max_length",
            max_length=77,
            truncation=True,
            return_tensors="pt"
        ).to(device)

        text_inputs_2 = pipe.tokenizer_2(
            caption,
            padding="max_length",
            max_length=77,
            truncation=True,
            return_tensors="pt"
        ).to(device)

        with torch.no_grad():
            text_embeddings = text_encoder(text_inputs.input_ids)[0]
            text_embeddings_2 = text_encoder_2(text_inputs_2.input_ids)[0]
            text_embeddings = torch.cat([text_embeddings, text_embeddings_2], dim=-1)

        # Predict noise
        model_pred = unet(
            noisy_latents,
            timesteps,
            encoder_hidden_states=text_embeddings
        ).sample

        # Calculate loss
        loss = torch.nn.functional.mse_loss(model_pred, noise)

        # Backprop
        accelerator.backward(loss)

        if (step + 1) % args.gradient_accumulation_steps == 0:
            optimizer.step()
            optimizer.zero_grad()

        # Update progress bar
        progress_bar.set_postfix({"loss": loss.item()})

        # Save checkpoint every 100 steps
        if (step + 1) % 100 == 0:
            print(f"Checkpoint at step {step + 1}")

    print("Training completed!")

    # Save LoRA weights
    print("Saving LoRA weights...")
    output_dir = "/tmp/lora_output"
    os.makedirs(output_dir, exist_ok=True)

    # Save LoRA weights
    unet_lora = accelerator.unwrap_model(unet)
    unet_lora.save_pretrained(output_dir)

    # Upload to Cloud Storage
    client = storage.Client()
    bucket = client.bucket(args.output_bucket)

    # Upload the LoRA weights
    for file_name in os.listdir(output_dir):
        if file_name.endswith(('.bin', '.safetensors', '.json')):
            local_path = os.path.join(output_dir, file_name)
            blob_path = os.path.join(args.output_path, file_name)
            blob = bucket.blob(blob_path)
            blob.upload_from_filename(local_path)
            print(f"Uploaded: {blob_path}")

    # Save training metadata
    metadata = {
        "brand_id": args.brand_id,
        "brand_name": args.brand_name,
        "num_images": len(image_paths),
        "training_steps": args.max_train_steps,
        "learning_rate": args.learning_rate,
        "lora_rank": args.rank,
        "model_path": f"gs://{args.output_bucket}/{args.output_path}"
    }

    metadata_path = os.path.join(output_dir, "training_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    # Upload metadata
    metadata_blob = bucket.blob(os.path.join(args.output_path, "training_metadata.json"))
    metadata_blob.upload_from_filename(metadata_path)

    print(f"Training complete! Model saved to gs://{args.output_bucket}/{args.output_path}")

if __name__ == "__main__":
    args = parse_args()
    train_lora(args)
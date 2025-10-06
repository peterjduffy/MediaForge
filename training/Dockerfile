FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    torch==2.1.0 \
    torchvision==0.16.0 \
    diffusers==0.25.0 \
    transformers==4.36.0 \
    accelerate==0.25.0 \
    peft==0.7.1 \
    safetensors==0.4.1 \
    google-cloud-storage==2.14.0 \
    google-cloud-firestore==2.14.0 \
    pillow==10.1.0 \
    numpy==1.26.2

# Copy training script
COPY train_lora.py /app/

# Make script executable
RUN chmod +x /app/train_lora.py

ENTRYPOINT ["python", "/app/train_lora.py"]

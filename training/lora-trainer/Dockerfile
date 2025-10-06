FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip3 install --upgrade pip
RUN pip3 install \
    torch==2.1.0 \
    torchvision \
    transformers==4.35.0 \
    diffusers==0.24.0 \
    accelerate==0.24.0 \
    peft==0.6.0 \
    bitsandbytes==0.41.0 \
    safetensors \
    xformers \
    google-cloud-storage \
    Pillow \
    numpy \
    tqdm

# Set up working directory
WORKDIR /app

# Copy training script
COPY train_lora.py .
COPY requirements.txt .

# Install additional requirements
RUN pip3 install -r requirements.txt

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV CUDA_VISIBLE_DEVICES=0
ENV PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512

# Run training script
ENTRYPOINT ["python3", "train_lora.py"]
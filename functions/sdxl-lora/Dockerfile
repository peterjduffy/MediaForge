# Use NVIDIA CUDA base image for GPU support
FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04

# Install Node.js 20
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies for SDXL
RUN pip3 install \
    diffusers \
    transformers \
    accelerate \
    safetensors \
    torch \
    torchvision \
    xformers

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Set environment variables
ENV PORT=8080
ENV PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512

EXPOSE 8080

CMD ["npm", "start"]
FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY index.js ./

# Run as non-root user
USER node

# Expose port
EXPOSE 8080

# Start the service
CMD ["node", "index.js"]

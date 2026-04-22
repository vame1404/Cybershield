# Use a Python base image with slim footprint
FROM python:3.9-slim

# Install system dependencies for OpenCV and ML
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set up a new user named "user" with user ID 1000 for Hugging Face security
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the rest of the application
COPY --chown=user . .

# Hugging Face Spaces expect the container to listen on port 7860
EXPOSE 7860

# Run the application using the renamed server.py
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "7860"]

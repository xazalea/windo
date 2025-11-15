FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    qemu-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app.py .

# Create storage directories
RUN mkdir -p /app/storage/images /app/storage/processed

# Expose port
EXPOSE 5000

# Run application
CMD ["python", "app.py"]


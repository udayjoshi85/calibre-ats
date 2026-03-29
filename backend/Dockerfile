FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start command - use Python to read PORT from environment
CMD ["python", "-c", "import os; import subprocess; port = os.environ.get('PORT', '8000'); subprocess.run(['uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', port])"]

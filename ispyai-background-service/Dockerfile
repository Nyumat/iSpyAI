# Use the official Python base image
# Make sure to speicfy platform so that it works on Fargate: https://stackoverflow.com/a/71102144
FROM --platform=linux/amd64 python:3.9.16-alpine3.18

# Set the working directory inside the container
WORKDIR /app

# Copy the python files into the container
COPY *.py .

# Install any necessary dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Run the main.py program when the container starts
CMD ["python", "main.py"]
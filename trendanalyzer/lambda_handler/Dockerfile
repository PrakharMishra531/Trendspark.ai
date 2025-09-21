# Use the official AWS Lambda Python 3.11 image as our base
FROM public.ecr.aws/lambda/python:3.11

# Set working directory
WORKDIR /var/task

# Install zip utility
RUN yum install -y zip && yum clean all

# Copy requirements and install
COPY requirements.txt .
RUN pip install -r requirements.txt -t .

# Copy your source code
COPY *.py .

# Create the final zip file
RUN zip -r deployment_package.zip .

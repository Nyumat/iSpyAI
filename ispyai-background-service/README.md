# Docker stuff

Build and run locally

```bash
sudo docker build -t video-to-blog-service .

sudo docker-compose up --build
```

Push to ECR

```bash
aws ecr get-login-password --region us-west-2 --profile aws-osuapp | docker login --username AWS --password-stdin 978103014270.dkr.ecr.us-west-2.amazonaws.com

docker tag video-to-blog-service:latest 978103014270.dkr.ecr.us-west-2.amazonaws.com/video-to-blog-service:latest

docker push 978103014270.dkr.ecr.us-west-2.amazonaws.com/video-to-blog-service:latest
```

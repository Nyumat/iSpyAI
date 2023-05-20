# Docker stuff

Build and run locally

```bash
sudo docker build -t video-to-blog-rest-api .

sudo docker-compose up --build
```

# Copilot
- Used to deploy REST API onto ECS Fargate cluster
```bash
copilot init
- name app as video-to-blog-rest-api
- choose loadbalanced service
- choose export port 80
- name service as rest-api-service
- select yes to create test environment

copilot app ls

copilot svc deploy

copilot svc logs --follow --since 1h
```

IAM policy

-   Add this policy to IAM role `video-to-blog-rest-api-test-rest-api-serv-TaskRole-W0VXY2RY2MCR`

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "AllowBatchAccess",
			"Effect": "Allow",
			"Action": [
				"batch:SubmitJob",
				"batch:DescribeJobs",
				"batch:TagResource"
			],
			"Resource": "*"
		}
	]
}
```

# iSpyAI

## Introduction

Welcomee to iSpyAI! Our project is a web application and distributed system that allows users to convert their favorite Youtube Videos into a full blog post.

The application is built using the a multitude of different technologies. The backend is split between a flask server and node server. The flask server is responsible for handling the video processing and the node server is responsible for handling the blog post generation. The frontend is built using React and is responsible for handling the user interface and user experience.

## Installation

1. Clone the repository
```bash
git clone https://github.com/Nyumat/iSpyAI.git
```

2. Install the dependencies

**Node Service**
```bash
cd ispyai-node-wrapper && npm install
```

**Frontend**
```bash
cd ispyai-frontend && npm install
```

3. Run the application
```bash
cd ispyai-node-wrapper && npm run dev
cd ispyai-frontend && npm run dev
```

## Usage

1. Navigate to the application in your browser
```bash
http://localhost:5173
```

2. Enter a Youtube URL and click submit

[![Generate Screen](../iSpyAI/assets/generate.png)](../iSpyAI/assets/generate.png)


3. Wait for the video to process

> Once the video has been processed, you will be redirected to the blog post page. The blog post page will contain the video title, and the blog post content. There will also be any relevant images or code snippets that were generated from the video.

[![Blog Post Screen](../iSpyAI/assets/blogpost.png)](../iSpyAI/assets/blogpost.png)
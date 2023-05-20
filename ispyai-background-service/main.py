from flask import Flask, request
import os
import openai
import tiktoken # Used to count tokens
import datetime
import hashlib
import boto3
from botocore.exceptions import ClientError
import logging

import redis

s3 = boto3.client('s3', region_name='us-west-2', config=boto3.session.Config(signature_version='s3v4'))


BUCKET_NAME = "video-to-blog"


def create_presigned_url(key_object_name, expiration=3600):
    """Generate a presigned URL to share an S3 object
    :param bucket_name: string
    :param object_name: string
    :param expiration: Time in seconds for the presigned URL to remain valid
    :return: Presigned URL as string. If error, returns None.
    """

    # Generate a presigned URL for the S3 object
    try:
        response = s3.generate_presigned_url('get_object',
                                              Params={'Bucket': BUCKET_NAME,
                                                      'Key': key_object_name},
                                              ExpiresIn=expiration)
    except ClientError as e:
        logging.error(e)
        return None

    # The response contains the presigned URL
    return response


def main():
    print("Starting job...")

    # print env variables
    userId = os.environ.get('userId')
    videoUrl = os.environ.get('videoUrl')
    # userId = "testUserId"
    # videoUrl = "testVideoUrl"

    print(f"env variable userId: {userId}")
    print(f"env variable videoUrl: {videoUrl}")

    # assert that userId and videoUrl are not None and not empty after being trimmed
    assert userId is not None and userId.strip() != ""
    assert videoUrl is not None and videoUrl.strip() != ""

    # create hash of videoUrl
    hash = hashlib.sha256(videoUrl.encode('utf-8')).hexdigest()

    key = hash

    print(f"key: {key}")

    # create file called {key} and save to /tmp/{key}
    file_path = f"/tmp/{key}"
    with open(file_path, "w") as file:
        file.write("First line of text\nSecond line of text\n")

    # Upload the file to the s3 bucket
    # s3.upload_file(file_path, Bucket=BUCKET_NAME, Key=key)
    expiration_time = datetime.datetime.now() + datetime.timedelta(hours=1)
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Expires=expiration_time,
        Body=open(file_path, 'rb')
    )

    # delete the file from /tmp/{key}
    os.remove(file_path)

    # Generate a presigned url for the file in the s3 bucket
    presigned_url = create_presigned_url(key)

    print(f"presigned url: {presigned_url}")


    # add element to redis
    r = redis.Redis(
        host='redis-18674.c273.us-east-1-2.ec2.cloud.redislabs.com',
        port=18674,
        username='default',
        password='MNSwDR1UOlq20ucYUhfoaoW5OSHIuEnY')
    
    redisKey = f"{userId} - {key}"

    r.hset(redisKey, mapping={
        'videoUrl': videoUrl,
        "presignedUrl": presigned_url
    })
    r.expire(redisKey, 3600)

    # disconnect from redis
    r.close()



# Used to get transcripts for videos
from transcripts import export_youtube_transcript

# Initialize Flask app
APP_NAME = "iSpyAI"
DEBUG = True
app = Flask(APP_NAME)

# Load OpenAI API key from file
with open("openai_api_key.txt", "r") as f:
    openai.api_key = f.read()

# Limit on number of GPT3 tokens per request
TOKEN_LIMIT = 2000

@app.route("/api/generate", methods=["POST"])
def generate():
    if DEBUG:
        print("Generating new blog for `{}` ...".format(request.json["url"]))
    transcript = export_youtube_transcript(request.json["url"])
    tokenizer = tiktoken.encoding_for_model("gpt-3.5-turbo")
    tokens = tokenizer.encode(transcript)
    token_count = len(tokens)
    if DEBUG:
        print("-- Token count: {} / {}".format(token_count, TOKEN_LIMIT))
    if token_count > TOKEN_LIMIT:
        return "Error: Transcript too long. Please use a shorter video.", 400
    prmt = "Please summarize the following transcript:\n\n" + transcript
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prmt,
        temperature=0.9,
        max_tokens=TOKEN_LIMIT,
        top_p=1,
        frequency_penalty=0.1,
        presence_penalty=0.6,
        stop=["\n\n", " Human:", " AI:"],
    )
    return response.choices[0].text


if __name__ == "__main__":
    main()
    app.run(debug=DEBUG)

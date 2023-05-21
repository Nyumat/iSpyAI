import os
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

def saveBlogToS3(videoUrlHash, content):
    # create hash of videoUrl
    # hash = hashlib.sha256(videoUrl.encode('utf-8')).hexdigest()

    s3ObjectKey = f"{videoUrlHash}.md"

    print(f"s3ObjectKey: {s3ObjectKey}")

    # create file called {key} and save to /tmp/{key}
    file_path = f"/tmp/{s3ObjectKey}"
    with open(file_path, "w") as file:
        file.write(content)

    # Upload the file to the s3 bucket
    # s3.upload_file(file_path, Bucket=BUCKET_NAME, Key=key)
    expiration_time = datetime.datetime.now() + datetime.timedelta(hours=1)
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=s3ObjectKey,
        Expires=expiration_time,
        Body=open(file_path, 'rb')
    )

    # delete the file from /tmp/{key}
    os.remove(file_path)

    # Generate a presigned url for the file in the s3 bucket
    presigned_url = create_presigned_url(s3ObjectKey)

    print(f"presigned url: {presigned_url}")

    return presigned_url

def savePresignedUrlToRedis(userId, videoUrlHash, presigned_url):
    # add element to redis
    r = redis.Redis(
        host='redis-18674.c273.us-east-1-2.ec2.cloud.redislabs.com',
        port=18674,
        username='default',
        password='MNSwDR1UOlq20ucYUhfoaoW5OSHIuEnY')
    
    redisKey = f"{userId}-{videoUrlHash}"

    # get the value of the key
    r.hset(redisKey, "presignedUrl", presigned_url)
    r.expire(redisKey, 3600)

    # disconnect from redis
    r.close()

def main():
    print("Starting job...")

    # print env variables
    userId = os.environ.get('userId')
    videoUrl = os.environ.get('videoUrl')
    videoUrlHash = os.environ.get('videoUrlHash')
    # userId = "testUserId"
    # videoUrl = "testVideoUrl"
    # videoUrlHash = "testVideoUrlHash"

    print(f"env variable userId: {userId}")
    print(f"env variable videoUrl: {videoUrl}")
    print(f"env variable videoUrlHash: {videoUrlHash}")

    # assert that env variables are not None and not empty after being trimmed
    assert userId is not None and userId.strip() != ""
    assert videoUrl is not None and videoUrl.strip() != ""
    assert videoUrlHash is not None and videoUrlHash.strip() != ""

    # TODO: 1. get video transcript from videoUrl


    # TODO: 2. generate blog post from video transcript and save to content
    content = "This is a test blog post. It is very short.\nHello there yo!"

    # save blog to s3
    presigned_url = saveBlogToS3(videoUrlHash, content)

    # save presigned url to redis
    savePresignedUrlToRedis(userId, videoUrlHash, presigned_url)

    print("Job complete!")
    

if __name__ == "__main__":
    main()

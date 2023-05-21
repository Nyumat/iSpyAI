import os
import logging
import datetime
import hashlib
import boto3
from botocore.exceptions import ClientError

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
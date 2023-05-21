import os
import logging
# Used to upload blog to s3
from s3 import saveBlogToS3
# Used to save presigned url (returned from saveBlogToS3) to redis
from savePresignedUrl import savePresignedUrlToRedis
# Used to get transcripts for videos
from transcripts import export_youtube_transcript, get_video_title_channel
# Used to generate blog post from video transcript
from generateBlog import generateBlog

def main():
    print("Starting job...")

    # print env variables
    userId = os.environ.get('userId')
    videoUrl = os.environ.get('videoUrl')
    videoUrlHash = os.environ.get('videoUrlHash')
    # userId = "testUserId"
    # videoUrl = "https://www.youtube.com/watch?v=4bjDrOleJgI&ab_channel=DailyDoseOfInternet"
    # videoUrlHash = "testVideoUrlHash"

    print(f"env variable userId: {userId}")
    print(f"env variable videoUrl: {videoUrl}")
    print(f"env variable videoUrlHash: {videoUrlHash}")

    # assert that env variables are not None and not empty after being trimmed
    assert userId is not None and userId.strip() != ""
    assert videoUrl is not None and videoUrl.strip() != ""
    assert videoUrlHash is not None and videoUrlHash.strip() != ""

    # 1. get video transcript from videoUrl
    transcript = export_youtube_transcript(videoUrl)
    print(f"transcript: {transcript[0:100]}...")
    # title = get_video_title_channel(videoUrl)
    # print(f"title: {title}")

    # 2. generate blog post from video transcript and save to content
    content = generateBlog(transcript)
    # content = "This is a test blog post.\nIt is alive!"
    print(f"content: {content[0:100]}...")

    # save blog to s3
    presigned_url = saveBlogToS3(videoUrlHash, content)

    # save presigned url to redis
    savePresignedUrlToRedis(userId, videoUrlHash, presigned_url)

    print("Job complete!")
    

if __name__ == "__main__":
    main()

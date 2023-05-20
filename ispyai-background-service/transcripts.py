from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
import requests
import json
import config
  
def export_youtube_transcript(url):

    parsed_url = urlparse(url)
    query_params = parse_qs(parsed_url.query)
    videoID = query_params.get("v")

    srt = YouTubeTranscriptApi.get_transcript(videoID[0])
    texts = [entry["text"] for entry in srt]
    spaceSeparated = ' '.join(texts)

    # # prints the result to a file
    # with open("transcript.txt", "w") as f:
    #     f.write(spaceSeparated)

    return spaceSeparated

def get_video_title_channel(url):

    parsed_url = urlparse(url)
    query_params = parse_qs(parsed_url.query)
    video_id = query_params.get("v")

    api_key = config.YOUTUBE_API_KEY
    url = f'https://www.googleapis.com/youtube/v3/videos?id={video_id[0]}&key={api_key}&part=snippet'

    response = requests.get(url)
    response_data = json.loads(response.text)

    if 'items' in response_data and len(response_data['items']) > 0:
        video_title = response_data['items'][0]['snippet']['title']
        channel_title = response_data['items'][0]['snippet']['channelTitle']
        return (channel_title, video_title)

    return None

# Example usage
# url = "https://www.youtube.com/watch?v=vzNZrdimAYs"
# video_title = get_video_title_channel(url)
# video_text = export_youtube_transcript(url)

# print(video_title)
# print(video_text)


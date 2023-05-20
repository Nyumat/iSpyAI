from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
import re
  
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
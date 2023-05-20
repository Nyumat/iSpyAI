from flask import Flask, request
import openai
import tiktoken # Used to count tokens
# Used to get transcripts for videos
from transcripts import export_youtube_transcript, get_video_title_channel

# Initialize Flask app
APP_NAME = "iSpyAI"
app = Flask(APP_NAME)

# Load OpenAI API key from file
with open("openai_api_key.txt", "r") as f:
    openai.api_key = f.read()

# Limit on number of GPT3 tokens per request
TOKEN_LIMIT = 2000

BASE_PROMPT = '''
                Below I will give you a video transcription.
                Please convert this transcription into a "blog post" summary, highlighting the key snippets and content.
                Make sure to use Markdown Format to write the post (.md), including headers, a table of contents, and good punctuation.\n
                '''

@app.route("/api/generate", methods=["POST", "GET"])
def generate():
    url = "https://youtu.be/CDokUdux0rc" #request.json["url"]
    print("Generating new blog for `{}` ...".format(url))
    #transcript = export_youtube_transcript(request.json["url"])
    transcript = "This is a test transcript. It is very short."
    tokenizer = tiktoken.encoding_for_model("gpt-3.5-turbo")
    prmt = BASE_PROMPT + transcript
    tokens = tokenizer.encode(prmt)
    token_count = len(tokens)
    print("-- Token count: {} / {}".format(token_count, TOKEN_LIMIT))
    if token_count > TOKEN_LIMIT:
        return "Error: Transcript too long. Please use a shorter video.", 400
    print(prmt)
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prmt,
        temperature=0.9,
        max_tokens=150,
        top_p=1,
        frequency_penalty=0.0,
        presence_penalty=0.6,
        stop=[" Human:", " AI:"],
    )
    print("Response: {}".format(response))
    return response.choices[0].text


@app.route("/api/title-channel", methods=["GET"])
def titleChannel():
    url = "https://youtu.be/CDokUdux0rc" #request.json["url"]
    (channel, title) = get_video_title_channel(url)
    return (channel, title)


if __name__ == "__main__":
    app.run(debug=True)

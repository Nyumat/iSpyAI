from flask import Flask, request
import os
import openai

# Used to count tokens
import tiktoken

# Used to get transcripts for videos
from transcripts import export_youtube_transcript

# Load OpenAI API key from file
with open("openai_api_key.txt", "r") as f:
    openai.api_key = f.read()

# Initialize Flask app
APP_NAME = "iSpyAI"
app = Flask(APP_NAME)

''' EXAMPLE REQUEST to OPENAI API:
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt="Hello! How are you?",
        temperature=0.9,
        max_tokens=150,
        top_p=1,
        frequency_penalty=0.0,
        presence_penalty=0.6,
        stop=[" Human:", " AI:"],
    )
'''

# Limit on number of GPT3 tokens per request
TOKEN_LIMIT = 2000

@app.route("/api/generate", methods=["POST"])
def generate():
    print("Generating new blog for {} ...".format(request.json["url"]))
    transcript = export_youtube_transcript(request.json["url"])
    tokenizer = tiktoken.Tokenizer(tokenization_standard="gpt3")
    token_count = len(tokenizer.tokenize(transcript))
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
    app.run(debug=True)

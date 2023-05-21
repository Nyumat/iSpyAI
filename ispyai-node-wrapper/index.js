import express from "express";
import dotenv from "dotenv";
import { YoutubeTranscript } from "youtube-transcript";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({
      status: "error",
      message: "url is required to generate blog post",
    });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url, {
      lang: "en",
      country: "US",
    });

    const result = await JSON.parse(JSON.stringify(transcript));
    const plainText = result.map((item) => item.text).join(" ");
    const omitDashText = plainText.replace(/-/g, " ");

    //     console.log(omitDashText);

    req.transcript = omitDashText;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
});

app.get("/api/blog/generate", async (req, res) => {
  const { transcript } = req;

  const prompt = `
      Hello. I'd like you tto convert this youtube video into a blog post for me. 
      
      I want the blog post to be in markdown format. (.md) I also want the blog post to be short and concise.

      Please make sure to include a table of contents and a conclusion at the end of the blog post.

      The video is about ${transcript.length} words long.

      The transcript is below:

      ${transcript}
      `;

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.9,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.6,
      stop: [" Human:", " AI:"],
    });

    console.log(response.data.choices);

    const { data } = response;
    const { choices } = data;
    const { text } = choices[0];

    return res.status(200).json({
      status: "success",
      data: text,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
});

app.use("*", async (req, res) => {
  return res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

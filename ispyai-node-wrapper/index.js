import express from "express";
import dotenv from "dotenv";
import { YoutubeTranscript } from "youtube-transcript";
import { Configuration, OpenAIApi } from "openai";
import cors from "cors";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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

app.post("/api", async (req, res) => {
  const { transcript } = req;

  const prompt = `
      Hello. I'd like you to convert this youtube video transcription into a blog post for me. 

      Please form your own introduction and conclusion. The blog post should fit inito maxTokens 500.
      
      I want the blog post to be in markdown format. (.md) I also want the blog post to be short and concise.

      The markdown should be in a code block.

      The Table of contents header should be in a h1 tag.

      Please make sure to include a table of contents and a headers for each section. 

      Make sure that the ending of each sentence ends with a period. 

      Please make sure that the blog post is in a readable format and that it is not too long.

      The blog post should not end prematurely.

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

  console.log("========REQUEST RECEIVED========");
  console.log(`REQUEST ROUTE:  ${JSON.stringify(req.originalUrl, null, "  ")}`);
  console.log(`REQUEST METHOD:  ${JSON.stringify(req.method, null, "  ")}`);
  console.log(`REQUEST BODY:  ${JSON.stringify(req.body, null, "  ")}`);
  console.log(`STATUS CODE:  ${JSON.stringify(req.statusCode, null, "  ")}`);
  console.log(`REQUEST HEADERS:  ${JSON.stringify(req.headers, null, "  ")}`);

  return res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

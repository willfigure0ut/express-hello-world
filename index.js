const express = require("express");
const path = require("path");
// const OpenAI = require('openai');
const { GoogleGenerativeAI } = require("@google/generative-ai");
let API_KEY = "AIzaSyAA-s8lSiHZ42f7QvqEJr7ixkE9RjIs0NE";
const axios = require("axios");
const GoogleImages = require("google-images");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.static("/index.html"));
app.use(express.static(path.join(__dirname, "/logo11.png")));

const client = new GoogleImages(
  "52673c0f180864dd5",
  "AIzaSyD5_JRWvxUmJI89aifEgJXHXIt_uaB2yHw",
);
// const openai = new OpenAI({ apiKey: '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' });
// async function getResponse(prompt) {
//   const response = await openai.completions.create({
//     model: 'text-davinci-003',
//     prompt: prompt,
//     max_tokens: 60
//   });

//   return response.choices[0].text;
// }
const genAI = new GoogleGenerativeAI(API_KEY);
async function getResponse(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/search", async (req, res) => {
  try {
    const options = {
      method: "POST",
      url: "https://api.cohere.ai/v1/generate",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: "Bearer 1Ii4zBBPEZiuEkN0xutodWl6AZOkxureTf4Tq5HR",
      },
      data: {
        truncate: "END",
        return_likelihoods: "NONE",
        prompt: `${req.query.search}`,
      },
    };

    const promptRequest = axios
      .request(options)
      .then((response) => response.data.generations[0].text);

    const searchTermRequest = getResponse(
      `Provide image prompts related to the query "${req.query.search}" for a Google Images search. Exclude any image links or other information in the response, only include the prompt itself.`,
    );

    const [answer, searchTerm] = await Promise.all([
      promptRequest,
      searchTermRequest,
    ]);

    const results = await client.search(searchTerm);
    let image = results.slice(0, 1);
    const output = {
      answer: answer,
      image: image,
    };
    res.send(output);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.listen(3000, () => console.log("Server started on port 3000"));

const express = require("express");
const path = require("path");

const { GoogleGenerativeAI } = require("@google/generative-ai");
let API_KEY = "AIzaSyBRXLaHLPPJI0j9Pv4lKzjauM19RCDT40Q";
const axios = require("axios");
const GoogleImages = require("google-images");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.static('public'))
app.use(express.static("/index.html"));
app.use(express.static(__dirname));

const client = new GoogleImages(
  "5654fdf28216e48a5",
  "AIzaSyBOvYyJUmDcm3ffeH4JpgjEEfQzLM8wKS8",
);

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

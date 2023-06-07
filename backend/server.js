const PORT = 8000;

//Import all relevant libraries
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { convert } = require("html-to-text");
const { Configuration, OpenAIApi } = require("openai");

//Set up Express.js server
const app = express();
app.use(express.json());
app.use(cors());

//Set up OpenAI API, prevChats array is used to store past messages from ChatGPT
//to simulate conversation
const API_KEY = "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";
const configuration = new Configuration({ apiKey: API_KEY });
const openai = new OpenAIApi(configuration);
const prevChats = [];

//POST request to OpenAI API
app.post("/completions", async (req, res) => {
  try {
    //Isolate and remove empty prompts
    if (req.body.content === "") throw new Error("No prompt provided!");

    //If article link is provided, retrieve and clean raw text data. If not,
    //simply push the role and prompt into prevChats array
    if (req.body.link != "") {
      //Use Axios GET to retrieve HTML data
      axios.get(req.body.link).then((response) => {
        //Use html-to-text to convert html data to raw text
        const articleText = convert(response.data.items[0].content_html, {
          selectors: [
            { selector: "a", options: { ignoreHref: "true" } },
            { selector: "img", format: "skip" },
          ],
        });
        const cleanedText = articleText.replace(/\n/g, " ");
        const newPrompt =
          req.body.content +
          " The article content is enclosed in triple backticks: ```" +
          cleanedText +
          "```";
        prevChats.push({
          role: "user",
          content: newPrompt,
        });
      });
    } else {
      prevChats.push({
        role: "user",
        content: req.body.content,
      });
    }
    const reply = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: prevChats,
      max_tokens: 10,
      temperature: 0,
    });
    prevChats.push(reply.data.choices[0].message);
    console.log(prevChats);
    res.send(reply.data);
  } catch (error) {
    console.error(error.message);
  }
});

//GET request to print the previous conversations onto the screen
app.get("/", (req, res) => {
  res.end(JSON.stringify(prevChats));
});

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

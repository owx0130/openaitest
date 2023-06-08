//Import all relevant libraries
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { convert } = require("html-to-text");
const { Configuration, OpenAIApi } = require("openai");

//Set up Express.js server
const PORT = 8000;
const app = express();
app.use(express.json());
app.use(cors());

//Set up OpenAI API, prevChats array is used to store past messages from ChatGPT
//to simulate conversation
const API_KEY = "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";
const configuration = new Configuration({ apiKey: API_KEY });
const openai = new OpenAIApi(configuration);
const prevChats = [];
const articleLinks = [];
const ARTICLE_URL = "https://www.inoreader.com/stream/user/1005506540/tag/Infrastructure/view/json";

//POST request to OpenAI API
app.post("/completions", async (req, res) => {
  try {
    //Isolate and remove empty prompts
    if (req.body.content === "") throw new Error("No prompt provided!");

    //If article link is provided, retrieve and clean raw text data. If not,
    //simply push the role and prompt into prevChats array
    if (req.body.link != "") {
      handleRSS(ARTICLE_URL);

    } else {
      prevChats.push({
        role: "user",
        content: req.body.content,
      });
    }
    console.log(articleLinks[0])
    /*
    //Call OpenAI API
    const reply = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: prevChats,
      max_tokens: 10,
      temperature: 0,
    });
    prevChats.push(reply.data.choices[0].message);
    console.log(prevChats)
    res.send(reply.data.choices[0].message);
    */
  } catch (error) {
    console.error(error.message);
  }
});

//GET request to print the previous conversations onto the screen
app.get("/", (req, res) => {
  res.end(JSON.stringify(prevChats));
});

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

async function handleRSS(link) {
  await axios.get(link).then((response) => {
    const articleContainer = response.data.items;
    articleContainer.forEach((article) => articleLinks.push(article.url));
  });
}

async function callOpenAI() {
  const reply = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: prevChats,
    max_tokens: 10,
    temperature: 0,
  });
  prevChats.push(reply.data.choices[0].message);
  console.log(prevChats)
  res.send(reply.data.choices[0].message);
}

//Use html-to-text to convert html data to raw text
/*
            const articleText = convert(article.content_html, {
              selectors: [
                { selector: "a", options: { ignoreHref: "true" } },
                { selector: "img", format: "skip" },
              ],
            });
            
                  //Form new text-based prompt and push it into prevChats array
      const newPrompt =
        req.body.content +
        " The text is given in triple backticks: ```" +
        cleanedText +
        "```";
      prevChats.push({
        role: "user",
        content: newPrompt,
      });


            //Remove newline characters
            const cleanedText = articleText.replace(/\n/g, " ");
            */

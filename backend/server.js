//Import relevant libraries
const express = require("express");
const cors = require("cors");
const { handleRSS, handleLinks, callOpenAI } = require("./lib");

//Set up Express.js server
const PORT = 8000;
const app = express();
app.use(express.json());
app.use(cors());

//Declare global variables
const prevChats = [];
const ARTICLE_URL = "https://www.inoreader.com/stream/user/1005506540/tag/Infrastructure/view/json";

//POST request to OpenAI API
app.post("/completions", async (req, res) => {
  try {
    //Isolate and remove empty prompts
    if (req.body.content === "") throw new Error("No prompt provided!");

    //Store article links from RSS Feed in articleLinks array. If no
    //link is provided, simply send the prompt to OpenAI API.
    if (req.body.link != "") {
      const articleLinks = await handleRSS(ARTICLE_URL);
      handleLinks(articleLinks);
    } else {
      prevChats.push({ role: "user", content: req.body.content });
      const reply = await callOpenAI(prevChats);
      prevChats.push(reply);
      console.log(prevChats);
      res.send(reply);
    }
  } catch (error) {
    console.error(error.message);
  }
});

//GET request to print out prevChats array
app.get("/", (req, res) => {
  res.end(JSON.stringify(prevChats));
});

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));
//Import relevant libraries
const express = require("express");
const cors = require("cors");
const { handleJSONFeed, handleLinks, callChatCompletion } = require("./lib");

//Set up Express.js server
const PORT = 8000;
const app = express();
app.use(express.json());
app.use(cors());

//Declare global variables. prevChats will store previous prompts and replies to facilitate
//conversation with ChatGPT.
const prevChats = [];

//POST request to OpenAI API (for JSONfeed links)
app.post("/JSONcompletions", async (req, res) => {
  try {
    if (req.body.content == "" || req.body.link == "")
      throw new Error("No prompt or link provided!");

    //Store article URLs in articleLinks
    const articleLinks = await handleJSONFeed(req.body.link);
    console.log(articleLinks);
    const fullArticle = await handleLinks(articleLinks);
    const newPrompt =
      req.body.content +
      " The articles are separated by triple backticks." +
      fullArticle;
    prevChats.push({ role: "user", content: newPrompt });

    const reply = await callChatCompletion(prevChats);
    prevChats.push(reply);
    console.log(prevChats);
    res.send(reply);
  } catch (error) {
    console.error(error.message);
  }
});

//POST request to OpenAI API (for regular chat completions)
app.post("/completions", async (req, res) => {
  if (req.body.content == "") throw new Error("No prompt provided!");
  prevChats.push({ role: "user", content: req.body.content });
  const reply = await callChatCompletion(prevChats);
  prevChats.push(reply);
  console.log(prevChats);
  res.send(reply);
});

//GET request to print out prevChats array
app.get("/", (req, res) => {
  res.end(JSON.stringify(prevChats));
});

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

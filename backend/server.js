//Import relevant libraries
const express = require("express");
const cors = require("cors");
const { handleJSONFeed, handleXMLFeed, handleLinks, callChatCompletion } = require("./lib");

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
    //Isolate and remove empty prompt or link fields
    if (req.body.content == "" || req.body.link == "")
      throw new Error("No prompt or link provided!");

    //Store article URLs in articleLinks, then extract article data from the links
    const articleLinks = await handleJSONFeed(req.body.link);
    const fullArticle = await handleLinks(articleLinks);

    //Form new prompt to pass into OpenAI API
    const newPrompt =
      req.body.content +
      " The articles are separated by triple backticks." +
      fullArticle;
    prevChats.push({ role: "user", content: newPrompt });

    //Call Chat Completion API and send the response back to frontend
    const reply = await callChatCompletion(prevChats);
    prevChats.push(reply);
    console.log(prevChats);
    res.send(reply);
  } catch (error) {
    console.error(error.message);
  }
});

//POST request to OpenAI API (for XML links)
app.post("/XMLcompletions", async (req, res) => {
  try {
    //Isolate and remove empty prompt or link fields
    if (req.body.content == "" || req.body.link == "")
      throw new Error("No prompt or link provided!");
    
    //Store article URLs in articleLinks, then extract article data from the links
    const articleLinks = await handleXMLFeed(req.body.link);

  } catch (error) {
    console.error(error.message);
  }
});

//POST request to OpenAI API (for regular chat completions)
app.post("/completions", async (req, res) => {
  try {
    //Isolate and remove empty prompt fields
    if (req.body.content == "") throw new Error("No prompt provided!");
    
    //Call Chat Completion API and send the response back to frontend
    prevChats.push({ role: "user", content: req.body.content });
    const reply = await callChatCompletion(prevChats);
    prevChats.push(reply);
    console.log(prevChats);
    res.send(reply);
  } catch (error) {
    console.error(error.message);
  }
});

//GET request to print out prevChats array
app.get("/", (req, res) => {
  res.end(JSON.stringify(prevChats));
});

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

//Import relevant libraries
const express = require("express");
const cors = require("cors");
const {
  getArticleData,
  getArticleContent,
  callChatCompletion,
} = require("./lib");

//Set up Express.js server
const PORT = 8000;
const app = express();
app.use(express.json());
app.use(cors());

//Declare global variables. prevChats will store previous prompts and replies to facilitate
//conversation with ChatGPT.
const prevChats = [];
const URLcontainer = [
  "https://www.inoreader.com/stream/user/1005506540/tag/Infrastructure/view/html?t=News%20%20-%20Infrastructure",
  "https://www.inoreader.com/stream/user/1005506540/tag/Space/view/html",
];
const endpoints = ["/infrastructure", "/space"];

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

//GET request for infrastructure-related articles
app.get(endpoints, async (req, res) => {
  let articleTitles = [];
  let articleLinks = [];
  await getArticleData(
    req.path == "/infrastructure" ? URLcontainer[0] : URLcontainer[1],
    articleLinks,
    articleTitles
  );
  const articleContent = await getArticleContent(articleLinks);
  res.send([articleContent, articleLinks, articleTitles]);
});

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

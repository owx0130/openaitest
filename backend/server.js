//Import relevant libraries
const express = require("express");
const cors = require("cors");
const { extractDocuments, readFromCSV, callChatCompletion } = require("./lib");
const { Document } = require("langchain/document");

//Set up Express.js server
const PORT = 8000;
const app = express();
app.use(express.json());
app.use(cors());

//Declare global variables
const prevChats = [];
const URLcontainer = [
  "https://www.inoreader.com/stream/user/1005506540/tag/Infrastructure/view/html?t=News%20%20-%20Infrastructure",
];
const endpoints = ["/infrastructure", "/infrastructureslow"];

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

//GET request to update article feed
app.get("/updateCSV", async (req, res) => {
  const docContainer = await extractDocuments(URLcontainer[0]);
  res.send(docContainer);
});

//GET request for article feed
app.get(endpoints, async (req, res) => {
  if (req.path == "/infrastructure") {
    const data = readFromCSV();
    const docContainer = [];
    data.forEach((item) => {
      const doc = new Document({
        pageContent: item[2],
        metadata: { source: item[1], title: item[0] },
      });
      docContainer.push(doc);
    });
    res.send(docContainer);
  } else {
    const docContainer = await extractDocuments(URLcontainer[0]);
    res.send(docContainer);
  }
});

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

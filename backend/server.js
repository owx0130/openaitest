//Import relevant libraries
const express = require("express");
const cors = require("cors");
const {
  extractDocuments,
  createNewVectorStore,
  loadVectorStore,
  callChatCompletion,
} = require("./lib");

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

//NEED TO CHANGE
app.get("/updatevectors", async (req, res) => {
  const docs = await extractDocuments(URLcontainer[0]);
  await createNewVectorStore(docs)
  res.send(docs);
})

//GET request for article feed
app.get(endpoints, async (req, res) => {
  if (req.path == "/infrastructure") {
    //NEED TO CHANGE
    const loadedVectorStore = await loadVectorStore("/db");
    console.log(loadedVectorStore)

    const docs = Array.from(
      loadedVectorStore.docstore._docs.values(),
      (doc) => doc
    );
    res.send(docs);
  } else {
    const docs = await extractDocuments(URLcontainer[0]);
    res.send(docs);
  }
});

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

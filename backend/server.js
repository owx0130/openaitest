//Import relevant libraries
const express = require("express");
const cors = require("cors");
const { extractDocuments, readFromCSV, handleIndivArticle } = require("./lib");

//Set up Express.js server
const PORT = 8000;
const app = express();
app.use(express.json());
app.use(cors());

//Declare global variables
const URLcontainer = [
  "https://www.inoreader.com/stream/user/1005506540/tag/Infrastructure/view/html?t=News%20%20-%20Infrastructure", 
  "https://www.inoreader.com/stream/user/1005506540/tag/News%20-%20China/view/html",
];
const rssEndpoints = ["/infrastructure", "/infrastructureslow"];

//GET request for article feed
app.get(rssEndpoints, async (req, res) => {
  if (req.path == "/infrastructure") {
    const reply = readFromCSV();
    res.send(reply);
  } else {
    const reply = await extractDocuments(URLcontainer[0]);
    res.send(reply);
  }
});

//POST request for individual articles
app.post("/indivarticle", async (req, res) => {
  const docOutput = await handleIndivArticle(req.body.content);
  res.send(docOutput);
});

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

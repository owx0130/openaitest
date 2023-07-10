//Import relevant libraries
const express = require("express");
const cors = require("cors");
const { extractDocuments, readFromCSV, handleIndivArticle } = require("./lib");

//Set up Express.js server
const PORT = 8000;
const app = express();
app.use(express.json());
app.use(cors());

//Declare endpoints object
const endpoints = {
  "/infrastructurerefresh": "https://www.inoreader.com/stream/user/1005506540/tag/Infrastructure/view/html?t=News%20%20-%20Infrastructure",
  "/chinarefresh": "https://www.inoreader.com/stream/user/1005506540/tag/News%20-%20China/view/html",
  "/airefresh": "https://www.inoreader.com/stream/user/1005506540/tag/AI%20-%20General/view/html",
  "/infrastructure": null,
  "/china": null,
  "/ai": null,
};

//GET request for RSS article feed
app.get(Object.keys(endpoints), async (req, res) => {
  if (req.path.includes("refresh")) {
    const raw_directory = "db" + req.path.slice(0, -7) + "raw.csv";
    const summary_directory = "db" + req.path.slice(0, -7) + ".csv";
    const reply = await extractDocuments(endpoints[req.path], raw_directory, summary_directory);
    res.send(reply);
  } else {
    const summary_directory = "db" + req.path + ".csv";
    const reply = readFromCSV(summary_directory);
    res.send(reply);
  }
});

//POST request for individual articles
app.post("/indivarticle", async (req, res) => {
  const docOutput = await handleIndivArticle(req.body.content);
  res.send(docOutput);
});

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

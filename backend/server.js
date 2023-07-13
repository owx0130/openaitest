//Import server dependencies
import express from "express";
import cors from "cors";
import { extractDocuments, readFromCSV, handleIndivArticle } from "./lib.js";

//Set up Express.js server
const PORT = 8000;
const app = express();
app.use(express.json());
app.use(cors());

const refresh_endpoints = {
  "/infrastructurerefresh":
    "https://www.inoreader.com/stream/user/1005506540/tag/Infrastructure/view/html?t=News%20%20-%20Infrastructure",
  "/chinarefresh":
    "https://www.inoreader.com/stream/user/1005506540/tag/News%20-%20China/view/html",
  "/airefresh":
    "https://www.inoreader.com/stream/user/1005506540/tag/AI%20-%20General/view/html",
};
const csv_endpoints = ["/infrastructure", "/china", "/ai"];

//GET request to refresh RSS Feed articles
app.get(Object.keys(refresh_endpoints), async (req, res) => {
  const category = req.path.slice(1, -7);
  const raw_directory = "db/" + category + "raw.csv";
  const summary_directory = "db/" + category + ".csv";
  const directories = [raw_directory, summary_directory];
  await extractDocuments(refresh_endpoints[req.path], directories, category);
  const reply = readFromCSV(summary_directory);
  res.send(reply);
});

//GET request to read article data from CSV files
app.get(csv_endpoints, async (req, res) => {
  const summary_directory = "db" + req.path + ".csv";
  const reply = readFromCSV(summary_directory);
  res.send(reply);
});

//POST request for individual articles
app.post("/indivarticle", async (req, res) => {
  const docOutput = await handleIndivArticle(req.body.content);
  res.send(docOutput);
});

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

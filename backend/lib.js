//Import dependencies
const axios = require("axios");
const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");
const { Document } = require("langchain/document");
const { JSDOM } = require("jsdom");
require("dotenv").config();

//Set up
const API_KEY = process.env.API_KEY;
const configuration = new Configuration({ apiKey: API_KEY });
const openai = new OpenAIApi(configuration);

async function getArticleMetadata(url, articleLinks, articleTitles) {
  const response = await axios.get(url);
  const dom = new JSDOM(response.data);
  const document = dom.window.document;
  const elementContainer = document.querySelectorAll("a.title_link.bluelink");
  elementContainer.forEach((elem) => {
    articleTitles.push(elem.textContent);
    articleLinks.push(elem.getAttribute("href"));
  });
}

async function getArticleContent(articleLinks, articleTitles) {
  const docContainer = [];
  for (let i = 0; i <= 1; i++) {
    let fullArticle = "";
    const response = await axios.get(articleLinks[i]);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const articleContent = document.querySelectorAll("p");
    articleContent.forEach((para) => {
      fullArticle += para.textContent;
    });
    const docOutput = new Document({
      pageContent: fullArticle,
      metadata: { source: articleLinks[i], title: articleTitles[i] },
    });
    docContainer.push(docOutput);
  }
  return docContainer;
}

//Driver function to extract documents and send back to frontend
async function extractDocuments(url) {
  let articleTitles = [],
    articleLinks = [];
  await getArticleMetadata(url, articleLinks, articleTitles);
  const docContainer = await getArticleContent(articleLinks, articleTitles);
  writeToCSV(docContainer);
  return docContainer;
}

function writeToCSV(docContainer) {
  const rows = Array.from(docContainer.values(), (item) => [
    item.metadata.title,
    item.metadata.source,
    item.pageContent,
  ]);
  let csvContent = "";
  rows.forEach((row) => {
    csvContent += row.join(";;") + "\n";
  });
  fs.writeFileSync("data.csv", csvContent, "utf8");
  console.log("CSV file has been written successfully.");
}

function readFromCSV() {
  const rows = [];
  const data = fs.readFileSync("data.csv", "utf8");
  const lines = data.split("\n");
  for (let i = 0; i < lines.length - 1; i++) {
    const row = lines[i].split(";;");
    rows.push(row);
  }
  return rows;
}

async function callChatCompletion(prevChats) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: prevChats,
    temperature: 0,
  });
  return response.data.choices[0].message;
}

module.exports = {
  extractDocuments,
  readFromCSV,
  callChatCompletion,
};

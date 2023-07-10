//Import dependencies
const axios = require("axios");
const fs = require("fs");
const { Document } = require("langchain/document");
const { JSDOM } = require("jsdom");
const {
  memory,
  summaryChain,
  overallSummaryChain,
  dataCleaningChain,
  inferringChain,
  splitter,
} = require("./llm-requirements");

//Get individual article URLS from RSS Feed link
async function getArticleLinks(url, docContainer) {
  const response = await axios.get(url);
  const dom = new JSDOM(response.data);
  const document = dom.window.document;
  const elementContainer = document.querySelectorAll("a.title_link.bluelink");
  for (let i = 0; i <= 1; i++) {
    const docOutput = new Document({
      pageContent: "",
      metadata: {
        source: elementContainer[i].getAttribute("href"),
        title: "",
        entities: "",
        relevant: "",
      },
    });
    docContainer.push(docOutput);
  }
}

//Extract the article content from the URLs (article body, title)
async function getArticleContent(docContainer) {
  for (let i = 0; i < docContainer.length; i++) {
    let fullArticle = "";
    const response = await axios.get(docContainer[i].metadata.source);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const articleContent = document.querySelectorAll("p");
    const raw_title = document.querySelector("title").textContent;
    articleContent.forEach((para) => {
      fullArticle += para.textContent;
    });
    docContainer[i].pageContent = fullArticle.replace(/\n/g, "");
    docContainer[i].metadata.title = raw_title.replace(/\n/g, "");
  }
}

//Update CSV database. This replaces all existing content in the current CSV file
function writeToCSV(docContainer, directory, summary) {
  const rows = docContainer.map((item) => [
    item.metadata.title,
    item.metadata.source,
    item.metadata.entities,
    item.metadata.relevant,
    item.pageContent,
  ]);
  let csvContent = "";
  rows.forEach((row) => {
    csvContent += row.join(";;") + "\n";
  });
  csvContent += summary;
  fs.writeFileSync(directory, csvContent, "utf8");
  console.log("CSV file has been written successfully.");
}

//Read summarized content from CSV database
function readFromCSV(directory) {
  const rows = [];
  const data = fs.readFileSync(directory, "utf8");
  const lines = data.split("\n");
  for (let i = 0; i < lines.length - 1; i++) {
    const row = lines[i].split(";;");
    rows.push(row);
  }
  const docContainer = [];
  rows.forEach((item) => {
    const doc = new Document({
      pageContent: item[4],
      metadata: {
        source: item[1],
        title: item[0],
        entities: item[2],
        relevant: item[3],
      },
    });
    docContainer.push(doc);
  });
  const summary = lines[lines.length - 1];
  return [docContainer, summary];
}

//Split article body into chunks
async function splitText(docContainer) {
  for (i = 0; i < docContainer.length; i++) {
    const docs = await splitter.splitDocuments([docContainer[i]]);
    const title = docContainer[i].metadata.title;
    for (j = 0; j < docs.length; j++) {
      const snippet = docs[j].pageContent;
      console.log(snippet);
      await summaryChain.call({ input: snippet });
    }
    const data = await memory.loadMemoryVariables();
    const summary = JSON.stringify(data.chat_history);
    console.log(summary);
    const cleanSummary = await dataCleaningChain.call({
      input: summary,
      title: title,
    });
    console.log(cleanSummary);
    docContainer[i].pageContent = cleanSummary.text.replace(/\n/g, "");
    memory.clear();
  }
}

//Infer entities and relevancy from summarised text
async function inferFromText(docContainer, category) {
  for (i = 0; i < docContainer.length; i++) {
    const data = await inferringChain.call({
      input: docContainer[i].pageContent,
      category: category,
    });
    const object = JSON.parse(data.text.replace(/\n/g, ""));
    docContainer[i].metadata.entities = object.entities;
    docContainer[i].metadata.relevant = object.relevant;
  }
}

//Provide an overall summary of all articles in the feed
async function summariseAllArticles(docContainer) {
  const contents = docContainer.map((item) => item.pageContent);
  const data = await overallSummaryChain.call({ input: contents });
  return data.text.replace(/\n/g, "");
}

//Driver function to extract and save RSS Feed articles to CSV
async function extractDocuments(
  url,
  raw_directory,
  summary_directory,
  category
) {
  let docContainer = [];
  await getArticleLinks(url, docContainer);
  await getArticleContent(docContainer);
  writeToCSV(docContainer, raw_directory, "");
  await splitText(docContainer);
  await inferFromText(docContainer, category);
  const summary = await summariseAllArticles(docContainer);
  writeToCSV(docContainer, summary_directory, summary);
}

//Driver function to handle individual articles
async function handleIndivArticle(url) {
  const docContainer = [
    new Document({
      pageContent: "",
      metadata: {
        source: url,
        title: "",
        entities: "",
      },
    }),
  ];
  await getArticleContent(docContainer);
  await splitText(docContainer);
  await inferFromText(docContainer);
  return docContainer[0];
}

module.exports = {
  extractDocuments,
  readFromCSV,
  handleIndivArticle,
};

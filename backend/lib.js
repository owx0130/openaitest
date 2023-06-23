//Import dependencies
const axios = require("axios");
const fs = require("fs");
const { Document } = require("langchain/document");
const { JSDOM } = require("jsdom");
require("dotenv").config();

//Import LangChain requirements
const { OpenAI } = require("langchain/llms/openai");
const { ConversationSummaryMemory } = require("langchain/memory");
const { LLMChain } = require("langchain/chains");
const { PromptTemplate } = require("langchain/prompts");

//Set up OpenAI/LangChain
const API_KEY = process.env.API_KEY;
const memory = new ConversationSummaryMemory({
  memoryKey: "chat_history",
  llm: new OpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    openAIApiKey: API_KEY,
  }),
});
const model = new OpenAI({ temperature: 0, openAIApiKey: API_KEY });
const prompt =
  PromptTemplate.fromTemplate(`When given a piece of text, the AI summarizes it succintly in under 30 words.
  Human: {input}
  AI:`);
const chain = new LLMChain({ llm: model, prompt, memory });

//Get article metadata (i.e. title and source URL)
async function getArticleMetadata(url, docContainer) {
  const response = await axios.get(url);
  const dom = new JSDOM(response.data);
  const document = dom.window.document;
  const elementContainer = document.querySelectorAll("a.title_link.bluelink");
  elementContainer.forEach((elem) => {
    const docOutput = new Document({
      pageContent: "",
      metadata: { source: elem.getAttribute("href"), title: elem.textContent },
    });
    docContainer.push(docOutput);
  });
}

//Extract the article content from the URLs
async function getArticleContent(docContainer) {
  for (let i = 0; i <= 0; i++) {
    let fullArticle = "";
    const response = await axios.get(docContainer[i].metadata.source);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const articleContent = document.querySelectorAll("p");
    articleContent.forEach((para) => {
      fullArticle += para.textContent;
    });
    docContainer[i].pageContent = fullArticle;
  }
}

//Update CSV database. This replaces all existing content in the current CSV file
function writeToCSV(docContainer, directory, summary) {
  const rows = Array.from(docContainer.values(), (item) => [
    item.metadata.title,
    item.metadata.source,
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
function readFromCSV() {
  const rows = [];
  const data = fs.readFileSync("summary.csv", "utf8");
  const lines = data.split("\n");
  for (let i = 0; i < lines.length - 1; i++) {
    const row = lines[i].split(";;");
    rows.push(row);
  }
  const docContainer = [];
  rows.forEach((item) => {
    const doc = new Document({
      pageContent: item[2],
      metadata: { source: item[1], title: item[0] },
    });
    docContainer.push(doc);
  });
  return [docContainer, lines[lines.length - 1]];
}

//Pass article content into OpenAI API to summarize
async function summarizeArticles(docContainer) {
  const articleContent = Array.from(
    docContainer.values(),
    (item) => item.pageContent
  );
  for (i = 0; i < articleContent.length; i++) {
    const res1 = await chain.call({ input: articleContent[i] });
    docContainer[i].pageContent = res1.text;
  }
  const data = await memory.loadMemoryVariables();
  const summary = JSON.stringify(data.chat_history);
  return summary;
}

//Driver function to extract and save articles to CSV
async function extractDocuments(url) {
  let docContainer = [];
  await getArticleMetadata(url, docContainer);
  await getArticleContent(docContainer);
  writeToCSV(docContainer, "data.csv", "");
  //const summary = await summarizeArticles(docContainer);
  //writeToCSV(docContainer, "summary.csv", summary);
  summary = "hi";
  return [docContainer, summary];
}

module.exports = {
  extractDocuments,
  readFromCSV,
};

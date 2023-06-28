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
const summaryPrompt = PromptTemplate.fromTemplate(
  `Summarize the given text succintly in under 30 words.
  Text: {input}`
);
const inferringPrompt = PromptTemplate.fromTemplate(
  `Given a piece of text, infer the 5 most relevant categories from it. Give your response
  in the format "X, X, X..."
  Text: {input}`
);
const summaryChain = new LLMChain({
  llm: model,
  prompt: summaryPrompt,
  memory,
});
const inferringChain = new LLMChain({ llm: model, prompt: inferringPrompt });

//Get individual article URLS from RSS Feed link
async function getArticleLinks(url, docContainer) {
  const response = await axios.get(url);
  const dom = new JSDOM(response.data);
  const document = dom.window.document;
  const elementContainer = document.querySelectorAll("a.title_link.bluelink");
  for (let i = 0; i <= 0; i++) {
    const docOutput = new Document({
      pageContent: "",
      metadata: {
        source: elementContainer[i].getAttribute("href"),
        title: "",
        rawcategories: "",
        summcategories: "",
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
    articleContent.forEach((para) => {
      fullArticle += para.textContent;
    });
    docContainer[i].pageContent = fullArticle.replace(/\n/g, "");
    docContainer[i].metadata.title =
      document.querySelector("title").textContent;
  }
}

//Update CSV database. This replaces all existing content in the current CSV file
function writeToCSV(docContainer, directory, summary) {
  const rows = Array.from(docContainer.values(), (item) => [
    item.metadata.title,
    item.metadata.source,
    item.metadata.rawcategories,
    item.metadata.summcategories,
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
      pageContent: item[4],
      metadata: {
        source: item[1],
        title: item[0],
        rawcategories: item[2],
        summcategories: item[3],
      },
    });
    docContainer.push(doc);
  });
  return [docContainer, lines[lines.length - 1]];
}

//Pass article content into OpenAI API to summarize and infer categories
async function callOpenAI(docContainer, endpoint) {
  const articleContent = Array.from(
    docContainer.values(),
    (item) => item.pageContent
  );
  for (i = 0; i < articleContent.length; i++) {
    const res1 = await summaryChain.call({ input: articleContent[i] });
    const res2 = await inferringChain.call({ input: articleContent[i] });
    const res3 = await inferringChain.call({ input: res1.text });
    docContainer[i].pageContent = res1.text.replace(/\n/g, "");
    docContainer[i].metadata.rawcategories = res2.text.replace(/\n/g, "");
    docContainer[i].metadata.summcategories = res3.text.replace(/\n/g, "");
    if (endpoint == "/translation") {
      //WIP
      console.log("hello")
    }
  }
  const data = await memory.loadMemoryVariables();
  const summary = JSON.stringify(data.chat_history);
  return summary;
}

//Driver function to extract and save RSS Feed articles to CSV
async function extractDocuments(url) {
  let docContainer = [];
  await getArticleLinks(url, docContainer);
  await getArticleContent(docContainer);
  writeToCSV(docContainer, "data.csv", "");
  const summary = await callOpenAI(docContainer);
  writeToCSV(docContainer, "summary.csv", summary);
  return [docContainer, summary];
}

//Drive function to handle individual articles
async function handleIndivArticle(url, endpoint) {
  const docContainer = [
    new Document({
      pageContent: "",
      metadata: {
        source: url,
        title: "",
        rawcategories: "",
        summcategories: "",
      },
    }),
  ];
  await getArticleContent(docContainer);
  await callOpenAI(docContainer, endpoint);
  return docContainer[0];
}

module.exports = {
  extractDocuments,
  readFromCSV,
  handleIndivArticle,
};

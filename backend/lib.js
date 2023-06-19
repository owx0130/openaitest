//Import dependencies
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");
const { JSDOM } = require("jsdom");
require("dotenv").config();

//Import Langchain requirements
const { Document } = require("langchain/document");
const { FaissStore } = require("langchain/vectorstores/faiss");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");

//Set up
const API_KEY = process.env.API_KEY;
const configuration = new Configuration({ apiKey: API_KEY });
const openai = new OpenAIApi(configuration);
const embeddings = new OpenAIEmbeddings({ openAIApiKey:API_KEY })

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

async function getArticleContent(articleLinks, articleTitles, docContainer) {
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
      metadata: { source: articleLinks[i], title: articleTitles[i]},
    });
    docContainer.push(docOutput);
  }
}

//Driver function to extract documents and send back to frontend
async function extractDocuments(url) {
  let docContainer = [], articleTitles = [], articleLinks = [];
  await getArticleMetadata(url, articleLinks, articleTitles);
  await getArticleContent(articleLinks, articleTitles, docContainer);
  return docContainer;
}

async function createNewVectorStore(docContainer) {
  const vectorStore = await FaissStore.fromDocuments(
    docContainer,
    embeddings,
  );
  await vectorStore.save("./db");
}

async function loadVectorStore(directory) {
  const loadedVectorStore = await FaissStore.load(
    directory,
    embeddings,
  )
  return loadedVectorStore;
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
  createNewVectorStore,
  loadVectorStore,
  callChatCompletion,
};

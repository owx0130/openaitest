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
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

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
  `Summarise the given text, using as few words as possible to do so.

  Text: {input}`
);
const CNtoENText = PromptTemplate.fromTemplate(
  `You will be given a piece of Chinese text. Perform the following steps:
  1. Translate the text to English.
  2. On the translated text, correct all sentence structure and grammatical errors appropriately.
  3. Provide the final text body as your response.

  Text: {input}`
);
const dataCleaningPrompt = PromptTemplate.fromTemplate(
  `Given a piece of text and a title, remove all text that is irrelevant to the title, and return
  the cleaned text body as your response.
  
  Text: {input}, Title: {title}`
);
const inferringPrompt = PromptTemplate.fromTemplate(
  `Given a text body, perform the following steps on it:

  1. Infer 5 relevant entities from it. Entities refer to 
  persons/organisations/names. Give only the entities in your response using the format:
  "Entity_1, Entity_2, Entity_3".

  2. Determine if the text is relevant to the given category. Reply with "Yes" if it is
  relevant, "No" otherwise.
  
  Respond with a JSON object in the following format:
  "entities": "insert response from step 1",
  "relevant": "insert response from step 2"

  Text: {input}, Category: {category}`
);

const summaryChain = new LLMChain({
  llm: model,
  prompt: summaryPrompt,
  memory,
});
const CNtoENTextChain = new LLMChain({ llm: model, prompt: CNtoENText });
const dataCleaningChain = new LLMChain({
  llm: model,
  prompt: dataCleaningPrompt,
});
const inferringChain = new LLMChain({ llm:model, prompt: inferringPrompt });
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 100,
});

//Get individual article URLS from RSS Feed link
async function getArticleLinks(url, docContainer) {
  const response = await axios.get(url);
  const dom = new JSDOM(response.data);
  const document = dom.window.document;
  const elementContainer = document.querySelectorAll("a.title_link.bluelink");
  for (let i = 0; i <= 2; i++) {
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
    articleContent.forEach((para) => {
      fullArticle += para.textContent;
    });
    docContainer[i].pageContent = fullArticle.replace(/\n/g, "");
    docContainer[i].metadata.title =
      document.querySelector("title").textContent;
  }
}

//Update CSV database. This replaces all existing content in the current CSV file
function writeToCSV(docContainer, directory) {
  const rows = Array.from(docContainer.values(), (item) => [
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
  fs.writeFileSync(directory, csvContent, "utf8");
  console.log("CSV file has been written successfully.");
}

//Read summarized content from CSV database
function readFromCSV() {
  const rows = [];
  const data = fs.readFileSync("RSSsummary.csv", "utf8");
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
  return docContainer;
}

//Split article body into chunks
async function splitText(docContainer) {
  for (i = 0; i < docContainer.length; i++) {
    const docs = await splitter.splitDocuments([docContainer[i]]);
    const title = docContainer[i].metadata.title;
    for (j = 0; j < docs.length; j++) {
      const snippet = docs[j].pageContent;
      await summaryChain.call({ input: snippet });
    }
    const data = await memory.loadMemoryVariables();
    const summary = JSON.stringify(data.chat_history).replace(/"/g, "");
    const cleanedSummary = await dataCleaningChain.call({
      input: summary,
      title: title,
    });
    docContainer[i].pageContent = cleanedSummary.text.replace(/\n/g, "");
    memory.clear();
  }
}

//Pass article content into OpenAI API to perform various actions
async function callOpenAI(docContainer, endpoint) {
  const articleContent = Array.from(
    docContainer.values(),
    (item) => item.pageContent
  );
  for (i = 0; i < articleContent.length; i++) {
    if (endpoint == "/translation") {
      const translatedTitle = await CNtoENTextChain.call({
        input: docContainer[i].metadata.title,
      });
      const translatedText = await CNtoENTextChain.call({
        input: articleContent[i],
      });
      articleContent[i] = translatedText.text;
      docContainer[i].metadata.translatedtitle = translatedTitle.text;
    }
    const data = await inferringChain.call({
      input: articleContent[i],
      category: "Infrastructure",
    });
    const object = JSON.parse(data.text.replace(/\n/g, ""));
    docContainer[i].metadata.entities = object.entities;
    docContainer[i].metadata.relevant = object.relevant;
  }
}

//Driver function to extract and save RSS Feed articles to CSV
async function extractDocuments(url) {
  let docContainer = [];
  await getArticleLinks(url, docContainer);
  await getArticleContent(docContainer);
  writeToCSV(docContainer, "RSSraw.csv");
  await splitText(docContainer);
  await callOpenAI(docContainer);
  writeToCSV(docContainer, "RSSsummary.csv");
  return docContainer;
}

//Driver function to handle individual articles
async function handleIndivArticle(url, endpoint) {
  const docContainer = [];
  if (endpoint == "/translation") {
    docContainer.push(
      new Document({
        pageContent: "",
        metadata: {
          source: url,
          title: "",
          translatedtitle: "",
          entities: "",
        },
      })
    );
  } else {
    docContainer.push(
      new Document({
        pageContent: "",
        metadata: {
          source: url,
          title: "",
          entities: "",
        },
      })
    );
  }
  await getArticleContent(docContainer);
  await splitText(docContainer);
  await callOpenAI(docContainer, endpoint);
  return docContainer[0];
}

module.exports = {
  extractDocuments,
  readFromCSV,
  handleIndivArticle,
};

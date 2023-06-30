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
  `Summarize the given text succintly in under 50 words.
  Text: {input}`
);
const inferringPrompt = PromptTemplate.fromTemplate(
  `Given a piece of text, infer only the 5 most relevant entities involved. Give your response
  in the format "X, X, X..."
  Text: {input}`
);
const CNtoENText = PromptTemplate.fromTemplate(
  `You will be given a piece of Chinese text. Perform the following steps:
  1. Translate the text to English.
  2. On the translated text, correct all sentence structure and grammatical errors appropriately.
  3. Provide the final text body as your response.
  Text: {input}`
);
const relevancyPrompt = PromptTemplate.fromTemplate(
  `You will be given a short piece of text. Determine if the text is relevant to the
  given category. Give your response only as a yes or no.
  Text: {input}
  Category: {category}`
)
const summaryChain = new LLMChain({
  llm: model,
  prompt: summaryPrompt,
  memory,
});
const inferringChain = new LLMChain({ llm: model, prompt: inferringPrompt });
const CNtoENTextChain = new LLMChain({ llm: model, prompt: CNtoENText });
const relevancyChain = new LLMChain({ llm: model, prompt: relevancyPrompt });

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
        entitiesraw: "",
        entitiessummary: "",
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
function writeToCSV(docContainer, directory, summary) {
  const rows = Array.from(docContainer.values(), (item) => [
    item.metadata.title,
    item.metadata.source,
    item.metadata.entitiesraw,
    item.metadata.entitiessummary,
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
      pageContent: item[5],
      metadata: {
        source: item[1],
        title: item[0],
        entitiesraw: item[2],
        entitiessummary: item[3],
        relevant: item[4],
      },
    });
    docContainer.push(doc);
  });
  return [docContainer, lines[lines.length - 1]];
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
    const res1 = await summaryChain.call({ input: articleContent[i] });
    const res2 = await inferringChain.call({ input: articleContent[i] });
    const res3 = await inferringChain.call({ input: res1.text });
    const res4 = await relevancyChain.call({ input: res1.text, category: "Infrastructure" });
    docContainer[i].pageContent = res1.text.replace(/\n/g, "");
    docContainer[i].metadata.entitiesraw = res2.text.replace(/\n/g, "");
    docContainer[i].metadata.entitiessummary = res3.text.replace(/\n/g, "");
    docContainer[i].metadata.relevant = res4.text.replace(/\n/g, "");
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
  writeToCSV(docContainer, "RSSraw.csv", "");
  const summary = await callOpenAI(docContainer);
  writeToCSV(docContainer, "RSSsummary.csv", summary);
  return [docContainer, summary];
}

//Drive function to handle individual articles
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
          entitiesraw: "",
          entitiessummary: "",
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
          entitiesraw: "",
          entitiessummary: "",
        },
      })
    );
  }
  await getArticleContent(docContainer);
  await callOpenAI(docContainer, endpoint);
  return docContainer[0];
}

module.exports = {
  extractDocuments,
  readFromCSV,
  handleIndivArticle,
};

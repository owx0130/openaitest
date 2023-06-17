//Import relevant libraries
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");
const { JSDOM } = require("jsdom");
require("dotenv").config();

//Set up OpenAI API
const API_KEY = process.env.API_KEY;
const configuration = new Configuration({ apiKey: API_KEY });
const openai = new OpenAIApi(configuration);

async function getArticleData(url, articleLinks, articleTitles) {
  const response = await axios.get(url);
  const dom = new JSDOM(response.data);
  const document = dom.window.document;
  const elementContainer = document.querySelectorAll("a.title_link.bluelink");
  elementContainer.forEach((elem) => {
    articleTitles.push(elem.textContent);
    articleLinks.push(elem.getAttribute("href"));
  });
}

//This function takes in an array of article links, extracts relevant information,
//and stores the content in an array
async function getArticleContent(articleLinks) {
  let articleContainer = [];
  for (let i = 0; i <= 1; i++) {
    let fullArticle = "";
    const response = await axios.get(articleLinks[i]);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const articleContent = document.querySelectorAll("p");
    articleContent.forEach((para) => {
      fullArticle += para.textContent;
    });
    articleContainer.push(fullArticle);
  }
  return articleContainer;
}

//Call the OpenAI API Chat Completion function
async function callChatCompletion(prevChats) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: prevChats,
    temperature: 0,
  });
  return response.data.choices[0].message;
}

module.exports = {
  getArticleData,
  getArticleContent,
  callChatCompletion,
};
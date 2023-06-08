//Import relevant libraries
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");
const { convert } = require("html-to-text");
const { JSDOM } = require("jsdom");

//Set up OpenAI API
const API_KEY = "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";
const configuration = new Configuration({ apiKey: API_KEY });
const openai = new OpenAIApi(configuration);

async function handleRSS(link) {
  const articleLinks = [];
  await axios.get(link).then((response) => {
    const articleContainer = response.data.items;
    articleContainer.forEach((article) => articleLinks.push(article.url));
  });
  return articleLinks;
}

async function handleLinks(articleLinks) {
  const response = await axios.get(articleLinks[0]);
  const dom = new JSDOM(response.data);
  const document = dom.window.document;
  const title = document.querySelectorAll("p");
  title.forEach(item => console.log(item.textContent))
}

async function callOpenAI(prevChats) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: prevChats,
    max_tokens: 10,
    temperature: 0,
  });
  return response.data.choices[0].message;
}

module.exports = { handleRSS, handleLinks, callOpenAI };
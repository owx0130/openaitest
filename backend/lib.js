//Import relevant libraries
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");
const { JSDOM } = require("jsdom");

//Set up OpenAI API
const API_KEY = "";
const configuration = new Configuration({ apiKey: API_KEY });
const openai = new OpenAIApi(configuration);

//This function gets data from the RSS JSONfeed link, and stores all article links
//in an array
async function handleRSS(link) {
  const articleLinks = [];
  await axios.get(link).then((response) => {
    const articleContainer = response.data.items;
    articleContainer.forEach((article) => articleLinks.push(article.url));
  });
  return articleLinks;
}

//This function takes in an array of article links, extracts the relevant information
//from every article (capped at 2), and returns a string with all the content
async function handleLinks(articleLinks) {
  let fullArticle = "```";
  for (let i = 0; i <= 1; i++) {
    const response = await axios.get(articleLinks[i]);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const articleContent = document.querySelectorAll("p");
    articleContent.forEach((para) => {
      fullArticle += para.textContent;
    });
    i == 1 ? fullArticle += "```" : fullArticle += "``` ```";
  };
  return fullArticle;
}

//Call the OpenAI API Chat Completion function
async function callChatCompletion(prevChats) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: prevChats,
    max_tokens: 10,
    temperature: 0,
  });
  return response.data.choices[0].message;
}

module.exports = { handleRSS, handleLinks, callChatCompletion };

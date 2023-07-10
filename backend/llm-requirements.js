//Import LangChain requirements
const { OpenAI } = require("langchain/llms/openai");
const { ConversationSummaryMemory } = require("langchain/memory");
const { LLMChain } = require("langchain/chains");
const { PromptTemplate } = require("langchain/prompts");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
require("dotenv").config();

//Set up ChatGPT API/LangChain
const API_KEY = process.env.API_KEY;
const model_options = {
  modelName: "gpt-3.5-turbo",
  temperature: 0,
  maxTokens: -1,
  openAIApiKey: API_KEY,
};
const memory = new ConversationSummaryMemory({
  memoryKey: "chat_history",
  llm: new OpenAI(model_options),
});
const model = new OpenAI(model_options);

//Set up Prompt Templates
const summaryPrompt = PromptTemplate.fromTemplate(
  `Summarise the given text, using as few words as possible.

  Provide only the summary as your reply.

  Text: {input}`
);
const overallSummaryPrompt = PromptTemplate.fromTemplate(
  `You will be provided with an array containing summarised content from various articles. Parse through
  the array and retrieve the content from every index, concatenating them into a single paragraph.
  Afterwards, summarise the paragraph using as few words as possible.

  Provide only the summary as your reply.

  Array of content: {input}`
);
const dataCleaningPrompt = PromptTemplate.fromTemplate(
  `You will be given an extract of an article body taken directly from the webpage. Your job is to 
  clean this article body by removing the irrelevant information from it. Any information that is not 
  relevant to the given article title can be removed. You do not need to explicitly state that the content
  is relevant to the title.Additionally, remove any instance of the "human" or "AI", and restructure 
  the affected parts to have a third party objective point of view.

  Reply only with the cleaned text body.

  Text: {input}, Title: {title}`
);
const inferringPrompt = PromptTemplate.fromTemplate(
  `Given a text body, perform the following steps on it:

  1. Infer a maximum of 5 relevant entities from it. Entities refer to key persons/organisations
  that are involved in the article. List all the entities separated by a comma on the same line.

  2. Determine if the text is relevant to the given category. Reply with "Yes" if it is
  relevant, "No" otherwise.
  
  Structure your reply as a JSON object with the properties below:
  "entities": "insert response from step 1",
  "relevant": "insert response from step 2"

  Reply only with the stringified JSON object such that it can be parsed immediately.

  Text: {input}, Category: {category}`
);

//Create Chains to call ChatGPT API
const summaryChain = new LLMChain({
  llm: model,
  prompt: summaryPrompt,
  memory,
});
const overallSummaryChain = new LLMChain({
  llm: model,
  prompt: overallSummaryPrompt,
});
const dataCleaningChain = new LLMChain({
  llm: model,
  prompt: dataCleaningPrompt,
});
const inferringChain = new LLMChain({ llm: model, prompt: inferringPrompt });
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

module.exports = {
  memory,
  summaryChain,
  overallSummaryChain,
  dataCleaningChain,
  inferringChain,
  splitter,
};

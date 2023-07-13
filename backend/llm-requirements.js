//Import LangChain requirements
import { OpenAI } from "langchain/llms/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";

//Set up ChatGPT API/LangChain
const API_KEY = process.env.API_KEY;
const model = new OpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0,
  maxTokens: -1,
  openAIApiKey: API_KEY,
});

//Set up Prompt Templates
const summaryPrompt = PromptTemplate.fromTemplate(
  `Summarise the given text, providing only the summary as your reply.

  Text: {input}`
);
const combineSummaryPrompt = PromptTemplate.fromTemplate(
  `You will be provided with an array of texts from one article. Condense all of them into 
  a single paragraph, ensuring that all sentences flow smoothly. Next, remove any repeated 
  or unrelated information from the paragraph, thereafter providing it as your response.

  Unrelated information refers to any content that is not relevant to the given article title.

  Array of content: {input}, Title: {title}`
);
const allArticlesSummaryPrompt = PromptTemplate.fromTemplate(
  `You will be provided with an array of article text from different articles. Summarize
  every article using as few words as possible, then condense them together to form a
  short paragraph. Provide this paragraph as your response.

  Array of content: {input}`
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
export const summaryChain = new LLMChain({ llm: model, prompt: summaryPrompt });
export const combineSummaryChain = new LLMChain({
  llm: model,
  prompt: combineSummaryPrompt,
});
export const allArticlesSummaryChain = new LLMChain({
  llm: model,
  prompt: allArticlesSummaryPrompt,
});
export const inferringChain = new LLMChain({ llm: model, prompt: inferringPrompt });

//Create text splitter
export const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
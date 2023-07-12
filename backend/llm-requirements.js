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
const overallSummaryPrompt = PromptTemplate.fromTemplate(
  `You will be provided with an array containing various summarised content at each index. Parse through
  the array and retrieve the content from every index, concatenating them into a single paragraph.
  Afterwards, summarise the paragraph using as few words as possible.

  Reply only with the summarised content, ignoring the input content.

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
export const overallSummaryChain = new LLMChain({
  llm: model,
  prompt: overallSummaryPrompt,
});
export const inferringChain = new LLMChain({ llm: model, prompt: inferringPrompt });
export const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const PORT = 8000
const express = require("express")
const cors = require("cors")
const request = require("request")
const { htmlToText } = require("html-to-text")
const { Configuration, OpenAIApi } = require("openai")
const app = express()
app.use(express.json())
app.use(cors())

const API_KEY = "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"
const prevChats = []
var newarticle = ""

const configuration = new Configuration({ apiKey: API_KEY })
const openai = new OpenAIApi(configuration)

app.post("/completions", async (req, res) => {

  try {
    let prompt = JSON.stringify(req.body.content)
    let start = prompt.indexOf("http")
    console.log(start)
    //Isolate and remove empty prompts
    if (prompt === "") {
      throw new Error("No prompt provided!")
    } else if (start >= 0) {
      console.log("2")

      //If prompt contains a URL, replace it with text data to be read by the API
      let articleUrl = prompt.substring(start, prompt.slice(start).indexOf(" ") + start)
      console.log(articleUrl, "1")
      request({
        url: articleUrl,
        method: "GET",
      }, (error, response, body) => {
        console.log("4")
        const article = JSON.parse(body)
        console.log("5")
        newarticle = htmlToText(JSON.stringify(article.items[0].content_html).replace(/<[^>]+>/g,""))
        console.log(newarticle)
      })
      
      let newcontent = req.body.content.replace(articleUrl, newarticle)
      req.body.content = newcontent
      console.log(req.body, "6")
    }

    prevChats.push(req.body)
    console.log(prevChats)
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: prevChats
    ,
      max_tokens: 10,
      temperature: 0,
    });
    console.log("hi")
    prevChats.push(response.data.choices[0].message);
    console.log(prevChats);
    res.send(response.data);
  } catch (error) {
    console.error(error.message);
  }
})

app.get("/", (req, res) => {res.end(JSON.stringify(prevChats))})

app.get("/getarticle", (req, res) => {
  request({
    url: articleUrl,
    method: "GET",
  }, (error, response, body) => {
    const article = JSON.parse(body)
    const newarticle = htmlToText(JSON.stringify(article.items[0].content_html).replace(/<[^>]+>/g,""))
    res.end(body)
    console.log(newarticle)
  })
})

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));
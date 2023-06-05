const PORT = 8000
const express = require("express")
const cors = require("cors")
const request = require("request")
const { Configuration, OpenAIApi } = require("openai")
const app = express()
app.use(express.json())
app.use(cors())

const articleUrl = "https://www.inoreader.com/stream/user/1005506540/tag/Cyber-Info/view/json"
const API_KEY = "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"
const arr = []

const configuration = new Configuration({
  apiKey: API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/completions", async (req, res) => {

  try {
    if (req.body.content === "") {
      throw new Error("No prompt provided!");
    }
    arr.push(req.body)
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: arr,
      max_tokens: 10,
      temperature: 0,
    });
    arr.push(response.data.choices[0].message);
    console.log(arr);
    res.send(response.data);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/", (req, res) => {
  res.end(JSON.stringify(arr))
})

app.get("/getarticle", (req, res) => {
  request({
    url: articleUrl,
    method: "GET",
  }, (error, response, body) => {
    let article = JSON.parse(body)
    res.end(body)
    console.log(article.items[0])
  })
})

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

const PORT = 8000
const express = require("express")
const cors = require("cors")
const { Configuration, OpenAIApi } = require("openai")
const app = express()
app.use(express.json())
app.use(cors())

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
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [req.body],
      max_tokens: 3,
      temperature: 0,
    });
    arr[0] = response.data.choices[0].message;
    console.log(response.data.choices[0].message);
    res.send(response.data);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/", (req, res) => {
  res.end(JSON.stringify(arr))
})

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

/*
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: req.body.message,
      max_tokens: 7,
    })
  }
  const response = await fetch("https://api.openai.com/v1/completions", options)
  const data = await response.json()
  res.send(data)
*/

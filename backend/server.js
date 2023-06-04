const PORT = 8000;
const express = require("express")
const cors = require("cors")
const { Configuration, OpenAIApi } = require("openai")
const app = express()
app.use(express.json())
app.use(cors())

const API_KEY = "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"

const configuration = new Configuration({
  apiKey: API_KEY,
})
const openai = new OpenAIApi(configuration)

app.post("/completions", async (req, res) => {
  
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
  
  try {
    if (req.body.message === "") {
      throw new Error("No prompt provided!")
    }
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: req.body.message,
      max_tokens: 7,
      temperature: 0,
    })
    const reply = response.data.choices[0].text
    return res.status(200).json({
      success: true,
      message: reply
    })
  }
  catch(error) {
    console.error(error.message)
  }
})

app.listen(PORT, () => console.log("Your server is running on Port " + PORT));

SECRET_KEY=""


async function fetchData() {
  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      Authorization:`Bearer ${SECRET_KEY}`,
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      model:"text-davinci-003",
      prompt:"How are you feeling today?",
      max_tokens: 7,
    })
  })
  const data = await response.json()
  console.log(data.choices[0].text)
}

fetchData()
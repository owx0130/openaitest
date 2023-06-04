import { useState } from "react"

export default function Main() {
  const [value, setValue] = useState("")
  const [prevChats, setPrevChats] = useState([])

  async function handleSubmit() {
    const options = {
      method: "POST",
      body: JSON.stringify({
        message: value
      }),
      headers: {
        "Content-type": "application/json"
      }
    }
    setValue("")
    const response = await fetch("http://localhost:8000/completions", options)
    const data = await response.json()
    console.log(data.message)
  }

  return (
    <div className="main">
      <h1>ChatGPT Experimental Clone</h1>
      <div className="feed">
        <h1>feed</h1>
      </div>
      <div className="bottom-section">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <p className="submit-button" onClick={handleSubmit}>&gt;&gt;</p>
      </div>
    </div>
  )
}
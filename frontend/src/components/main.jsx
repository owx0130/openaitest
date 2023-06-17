import { useState } from "react";
import Feed from "./feed";

export default function Main() {
  const [prompt, setPrompt] = useState("");
  const [prevChats, setPrevChats] = useState([]);

  async function callAPI(options, link) {
    const response = await fetch(link, options);
    const reply = await response.json();
    setPrevChats([
      ...prevChats,
      { role: "user", content: prompt },
      { role: reply.role, content: reply.content },
    ]);
    setPrompt("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    //Set up options for POST request with Fetch API
    const options = {
      method: "POST",
      body: JSON.stringify({
        content: prompt,
      }),
      headers: {
        "Content-type": "application/json",
      },
    };
    callAPI(options, "http://localhost:8000/completions");
  }

  return (
    <div className="main">
      <h1>Chatbot Function</h1>
      <div className="bottom-section">
        <ul>
          {prevChats.map((element, index) => (
            <Feed key={index} data={element} />
          ))}
        </ul>
        <form className="form-style" onSubmit={(e) => handleSubmit(e)}>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            type="text"
            placeholder="prompt"
          />
          <input type="submit" hidden />
        </form>
      </div>
    </div>
  );
}

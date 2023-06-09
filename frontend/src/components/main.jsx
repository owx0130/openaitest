import { useState } from "react";
import Feed from "./feed";

export default function Main() {
  const [prompt, setPrompt] = useState("");
  const [articleURL, setArticleURL] = useState("");
  const [prevChats, setPrevChats] = useState([]);

  async function handleSubmit(event) {
    event.preventDefault();
    
    //Set up options for POST request with Fetch API
    const options = {
      method: "POST",
      body: JSON.stringify({
        content: prompt,
        link: articleURL
      }),
      headers: {
        "Content-type": "application/json",
      },
    };

    //Make Fetch API call to backend server
    const response = await fetch("http://localhost:8000/completions", options);
    const reply = await response.json();
    setPrevChats([
      ...prevChats,
      {role: "user", content: prompt},
      {role: reply.role, content: reply.content}
    ])
    setPrompt("")
  }

  return (
    <div className="main">
      <h1>RSS Feed Summarizer</h1>
      <div className="bottom-section">
        <ul>
          {prevChats.map((element, index) => (
            <Feed key={index} data={element} />
          ))}
        </ul>
        <form className="form-style" onSubmit={(e) => handleSubmit(e)}>
          <input
            value={articleURL}
            onChange={(e) => setArticleURL(e.target.value)}
            type="text"
            placeholder="insert RSS feed link here to summarize articles (if any): https://..."
          />
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
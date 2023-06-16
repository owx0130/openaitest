import { useState } from "react";
import Feed from "./feed";

export default function Main() {
  const [prompt, setPrompt] = useState("");
  const [articleURL, setArticleURL] = useState("");
  const [prevChats, setPrevChats] = useState([]);
  const [isJSON, setIsJSON] = useState(0);
  const [isXML, setIsXML] = useState(0);

  function handleJSONClick() {
    if (isXML) {
      setIsJSON(1 - isJSON);
      setIsXML(0);
    } else setIsJSON(1 - isJSON);
  }

  function handleXMLClick() {
    if (isJSON) {
      setIsXML(1 - isXML);
      setIsJSON(0);
    } else setIsXML(1 - isXML);
  }

  async function callAPI(options, link) {
    const response = await fetch(link, options);
    const reply = await response.json();
    setPrevChats([
      ...prevChats,
      { role: "user", content: prompt },
      { role: reply.role, content: reply.content },
    ]);
    setPrompt("");
    setArticleURL("");
    setIsJSON(0);
    setIsXML(0);
  }

  function handleSubmit(event) {
    event.preventDefault();

    //Set up options for POST request with Fetch API
    const options = {
      method: "POST",
      body: JSON.stringify({
        content: prompt,
        link: articleURL,
      }),
      headers: {
        "Content-type": "application/json",
      },
    };

    if (isJSON) callAPI(options, "http://localhost:8000/JSONcompletions");
    else if (isXML) callAPI(options, "http://localhost:8000/XMLcompletions");
    else callAPI(options, "http://localhost:8000/completions");
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
        <div className="button-container">
          {isJSON ? (
            <button className="button-clicked" onClick={handleJSONClick}>
              + JSONfeed Link
            </button>
          ) : (
            <button className="button-style" onClick={handleJSONClick}>
              + JSONfeed Link
            </button>
          )}
          {isXML ? (
            <button className="button-clicked" onClick={handleXMLClick}>
              + XML Link
            </button>
          ) : (
            <button className="button-style" onClick={handleXMLClick}>
              + XML Link
            </button>
          )}
        </div>
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

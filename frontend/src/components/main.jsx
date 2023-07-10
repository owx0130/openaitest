import { useState } from "react";

export default function Main() {
  const INDIV_URL = "http://localhost:8000/indivarticle";
  const [content, setContent] = useState("");
  const [entities, setEntities] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [prompt, setPrompt] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const options = {
      method: "POST",
      body: JSON.stringify({
        content: prompt,
      }),
      headers: {
        "Content-type": "application/json",
      },
    };
    fetch(INDIV_URL, options).then(async (reponse) => {
      const data = await reponse.json();
      setContent(data.pageContent);
      setTitle(data.metadata.title);
      setLink(prompt);
      setEntities(data.metadata.entities);
    });
  }

  return (
    <div className="main">
      <h1>Individual Article Extraction</h1>
      <table style={{ marginBottom: "30px" }}>
        <thead>
          <tr>
            <th>Article Title</th>
            <th>Description</th>
            <th>Entity Extraction</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <a href={link}>{title}</a>
            </td>
            <td>{content}</td>
            <td>{entities}</td>
          </tr>
        </tbody>
      </table>
      <form className="form-style" onSubmit={(e) => handleSubmit(e)}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          type="text"
          placeholder="insert article link here"
        />
        <input type="submit" hidden />
      </form>
    </div>
  );
}

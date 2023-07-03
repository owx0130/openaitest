import { useState } from "react";

export default function Main() {
  const [articleContainer, setArticleContainer] = useState("");
  const [articleEntities, setArticleEntities] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [articleLink, setArticleLink] = useState("");
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
    fetch("http://localhost:8000/indivarticle", options).then(
      async (reponse) => {
        const data = await reponse.json();
        setArticleContainer(data.pageContent);
        setArticleTitle(data.metadata.title);
        setArticleLink(prompt);
        setArticleEntities(data.metadata.entities);
      }
    );
  }

  return (
    <div className="main">
      <h1>Individual Article Extraction</h1>
      <table style={{ marginBottom: "30px" }}>
        <thead>
          <tr>
            <th>Article Title</th>
            <th>URL</th>
            <th>Description</th>
            <th>Entity Extraction</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{articleTitle}</td>
            <td>
              <a href={articleLink}>{articleLink}</a>
            </td>
            <td>{articleContainer}</td>
            <td>{articleEntities}</td>
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

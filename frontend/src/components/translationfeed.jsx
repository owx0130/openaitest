import { useState } from "react";

export default function TranslationFeed() {
  const [articleContainer, setArticleContainer] = useState("");
  const [articleEntities, setArticleEntities] = useState("");
  const [articleEntitiesSummary, setArticleEntitiesSummary] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [originalArticleTitle, setOriginalArticleTitle] = useState("");
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
    fetch("http://localhost:8000/translation", options).then(
      async (reponse) => {
        const data = await reponse.json();
        setArticleContainer(data.pageContent);
        setArticleTitle(data.metadata.title);
        setOriginalArticleTitle(data.metadata.translatedtitle);
        setArticleLink(prompt);
        setArticleEntities(data.metadata.entitiesraw);
        setArticleEntitiesSummary(data.metadata.entitiessummary);
        console.log(data);
      }
    );
  }

  return (
    <div className="main">
      <h1>Translation (from CN to EN)</h1>
      <table style={{ marginBottom: "30px" }}>
        <thead>
          <tr>
            <th>Article Title</th>
            <th>URL</th>
            <th>Description</th>
            <th>Entity Extraction (raw text)</th>
            <th>Entity Extraction (summarised text)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {originalArticleTitle}
              <br />
              <br />
              {articleTitle}
            </td>
            <td>
              <a href={articleLink}>{articleLink}</a>
            </td>
            <td>{articleContainer}</td>
            <td>{articleEntities}</td>
            <td>{articleEntitiesSummary}</td>
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
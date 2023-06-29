import { useState } from "react";

export default function TranslationFeed() {
  const [articleContainer, setArticleContainer] = useState("");
  const [articleCategoriesRaw, setArticleCategoriesRaw] = useState("");
  const [articleCategoriesSumm, setArticleCategoriesSumm] = useState("");
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
        setOriginalArticleTitle(data.metadata.translation[0].text);
        setArticleLink(prompt);
        setArticleCategoriesRaw(data.metadata.rawcategories);
        setArticleCategoriesSumm(data.metadata.summcategories);
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
            <th>Categories (from raw text)</th>
            <th>Categories (from summary text)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{originalArticleTitle}<br /><br />{articleTitle}</td>
            <td>
              <a href={articleLink}>{articleLink}</a>
            </td>
            <td>{articleContainer}</td>
            <td>{articleCategoriesRaw}</td>
            <td>{articleCategoriesSumm}</td>
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

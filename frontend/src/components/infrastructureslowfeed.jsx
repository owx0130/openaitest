import { useState, useEffect } from "react";

export default function InfrastructureSlowFeed() {
  const [articleContainer, setArticleContainer] = useState([]);
  const [articleCategoriesRaw, setArticleCategoriesRaw] = useState([]);
  const [articleCategoriesSumm, setArticleCategoriesSumm] = useState([]);
  const [articleTitles, setArticleTitles] = useState([]);
  const [articleLinks, setArticleLinks] = useState([]);
  const [summary, setSummary] = useState("");

  function fetchArticles() {
    fetch("http://localhost:8000/infrastructureslow").then(async (response) => {
      const data = await response.json();
      console.log(data);
      setArticleContainer(
        Array.from(data[0].values(), (item) => item.pageContent)
      );
      setArticleTitles(
        Array.from(data[0].values(), (item) => item.metadata.title)
      );
      setArticleLinks(
        Array.from(data[0].values(), (item) => item.metadata.source)
      );
      setArticleCategoriesRaw(
        Array.from(data[0].values(), (item) => item.metadata.rawcategories)
      );
      setArticleCategoriesSumm(
        Array.from(data[0].values(), (item) => item.metadata.summcategories)
      );
      setSummary(data[1]);
    });
  }

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="main">
      <h1>Infrastructure Feed</h1>
      <table>
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
          {articleContainer.map((element, index) => (
            <tr>
              <td>{articleTitles[index]}</td>
              <td>
                <a href={articleLinks[index]}>{articleLinks[index]}</a>
              </td>
              <td>{element}</td>
              <td>{articleCategoriesRaw[index]}</td>
              <td>{articleCategoriesSumm[index]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="summary-container">
        <p>Overall Summary: {summary}</p>
      </div>
    </div>
  );
}

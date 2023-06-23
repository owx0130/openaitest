import { useState, useEffect } from "react";

export default function InfrastructureFeed() {
  const [articleContainer, setArticleContainer] = useState([]);
  const [articleTitles, setArticleTitles] = useState([]);
  const [articleLinks, setArticleLinks] = useState([]);
  const [summary, setSummary] = useState("");

  function setStates(data) {
    setArticleContainer(
      Array.from(data[0].values(), (item) => item.pageContent)
    );
    setArticleTitles(
      Array.from(data[0].values(), (item) => item.metadata.title)
    );
    setArticleLinks(
      Array.from(data[0].values(), (item) => item.metadata.source)
    );
    setSummary(data[1]);
  }

  function fetchArticles() {
    fetch("http://localhost:8000/infrastructure").then(async (response) => {
      const data = await response.json();
      setStates(data);
    });
  }

  function handleClick() {
    fetch("http://localhost:8000/infrastructureslow").then(async (response) => {
      const data = await response.json();
      setStates(data);
    });
  }

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="main">
      <h1>Infrastructure Feed</h1>
      <button className="main-button" onClick={handleClick}>
        Click here to refresh articles
      </button>
      <table>
        <thead>
          <tr>
            <th>Article Title</th>
            <th>URL</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {articleContainer.map((element, index) => (
            <tr key={index}>
              <td>{articleTitles[index]}</td>
              <td>
                <a href={articleLinks[index]}>{articleLinks[index]}</a>
              </td>
              <td>{element}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="summary-container">
        <p>Summary: {summary}</p>
      </div>
    </div>
  );
}

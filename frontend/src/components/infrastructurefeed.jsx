import { useState, useEffect } from "react";

export default function InfrastructureFeed() {
  const [articleContainer, setArticleContainer] = useState([]);
  const [articleTitles, setArticleTitles] = useState([]);
  const [articleLinks, setArticleLinks] = useState([]);

  function setStates(data) {
    setArticleContainer(Array.from(data.values(), item => item.pageContent));
    setArticleTitles(Array.from(data.values(), item => item.metadata.title));
    setArticleLinks(Array.from(data.values(), item => item.metadata.source));
  }

  function fetchArticles() {
    fetch("http://localhost:8000/infrastructure").then(async (response) => {
      const data = await response.json();
      setStates(data);
    });
  }

  function handleClick() {
    fetch("http://localhost:8000/updateCSV").then(async (response) => {
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
      <button className="main-button" onClick={handleClick}>Click here to refresh articles</button>
      <table>
        <tr>
          <th>Article Title</th>
          <th>URL</th>
          <th>Description</th>
        </tr>
        {articleContainer.map((element, index) => (
          <tr>
            <td>{articleTitles[index]}</td>
            <td>
              <a href={articleLinks[index]}>{articleLinks[index]}</a>
            </td>
            <td>{element}</td>
          </tr>
        ))}
      </table>
      <div></div>
    </div>
  );
}

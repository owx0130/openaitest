import { useState, useEffect } from "react";

export default function InfrastructureSlowFeed() {
  const [articleContainer, setArticleContainer] = useState([]);
  const [articleTitles, setArticleTitles] = useState([]);
  const [articleLinks, setArticleLinks] = useState([]);

  function fetchArticles() {
    fetch("http://localhost:8000/infrastructureslow").then(async (response) => {
      const data = await response.json();
      setArticleContainer(Array.from(data.values(), item => item.pageContent));
      setArticleTitles(Array.from(data.values(), item => item.metadata.title));
      setArticleLinks(Array.from(data.values(), item => item.metadata.source));
    });
  }

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="main">
      <h1>Infrastructure Feed</h1>
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

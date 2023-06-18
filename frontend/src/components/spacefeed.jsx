import { useState, useEffect } from "react";

export default function SpaceFeed() {
  const [articleContainer, setArticleContainer] = useState([]);
  const [articleTitles, setArticleTitles] = useState([]);
  const [articleLinks, setArticleLinks] = useState([]);

  function fetchArticles() {
    fetch("http://localhost:8000/space").then(async (response) => {
      const data = await response.json();
      setArticleContainer(data[0]);
      setArticleLinks(data[1]);
      setArticleTitles(data[2]);
    });
  }

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="main">
      <h1>Space Feed</h1>
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

import { useState, useEffect } from "react";

export default function InfrastructureSlowFeed() {
  const [articleContainer, setArticleContainer] = useState([]);
  const [articleEntities, setArticleEntities] = useState([]);
  const [articleTitles, setArticleTitles] = useState([]);
  const [articleLinks, setArticleLinks] = useState([]);
  const [relevancy, setRelevancy] = useState([]);

  function fetchArticles() {
    fetch("http://localhost:8000/infrastructureslow").then(async (response) => {
      const data = await response.json();
      console.log(data);
      setArticleContainer(
        Array.from(data.values(), (item) => item.pageContent)
      );
      setArticleTitles(
        Array.from(data.values(), (item) => item.metadata.title)
      );
      setArticleLinks(
        Array.from(data.values(), (item) => item.metadata.source)
      );
      setArticleEntities(
        Array.from(data.values(), (item) => item.metadata.entities)
      );
      setRelevancy(
        Array.from(data.values(), (item) => item.metadata.relevant)
      )
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
            <th>Entity Extraction</th>
            <th>Relevant?</th>
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
              <td>{articleEntities[index]}</td>
              <td>{relevancy[index]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div></div>
    </div>
  );
}

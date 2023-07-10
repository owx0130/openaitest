import { useState, useEffect } from "react";

export default function InfrastructureSlowFeed() {
  const REFRESH_URL = "http://localhost:8000/infrastructurerefresh";
  const [contents, setContents] = useState([]);
  const [entities, setEntities] = useState([]);
  const [titles, setTitles] = useState([]);
  const [links, setLinks] = useState([]);
  const [relevancy, setRelevancy] = useState([]);

  function setStates(data) {
    setContents(Array.from(data.values(), (item) => item.pageContent));
    setTitles(Array.from(data.values(), (item) => item.metadata.title));
    setLinks(Array.from(data.values(), (item) => item.metadata.source));
    setEntities(Array.from(data.values(), (item) => item.metadata.entities));
    setRelevancy(Array.from(data.values(), (item) => item.metadata.relevant));
  }

  function fetchArticles() {
    fetch(REFRESH_URL).then(async (response) => {
      const data = await response.json();
      setStates(data);
    });
  }

  useEffect(fetchArticles, []);

  return (
    <div className="main">
      <h1>Infrastructure Feed</h1>
      <table>
        <thead>
          <tr>
            <th>Article Title</th>
            <th>Description</th>
            <th>Entity Extraction</th>
            <th>Relevant?</th>
          </tr>
        </thead>
        <tbody>
          {contents.map((element, index) => (
            <tr>
              <td>
                <a href={links[index]}>{titles[index]}</a>
              </td>
              <td>{element}</td>
              <td>{entities[index]}</td>
              <td>{relevancy[index]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div></div>
    </div>
  );
}

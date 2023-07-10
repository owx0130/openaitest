import { useState, useEffect } from "react";

export default function ChinaFeed() {
  const REFRESH_URL = "http://localhost:8000/chinarefresh";
  const CSV_URL = "http://localhost:8000/china";
  const [contents, setContents] = useState([]);
  const [entities, setEntities] = useState([]);
  const [titles, setTitles] = useState([]);
  const [links, setLinks] = useState([]);
  const [relevance, setRelevance] = useState([]);
  const [summary, setSummary] = useState("");

  function setStates(data) {
    setContents(data[0].map((item) => item.pageContent));
    setTitles(data[0].map((item) => item.metadata.title));
    setLinks(data[0].map((item) => item.metadata.source));
    setEntities(data[0].map((item) => item.metadata.entities));
    setRelevance(data[0].map((item) => item.metadata.relevant));
    setSummary(data[1]);
  }

  function fetchArticles() {
    fetch(CSV_URL).then(async (response) => {
      const data = await response.json();
      setStates(data);
    });
  }

  function handleClick() {
    fetch(REFRESH_URL).then(async (response) => {
      const data = await response.json();
      setStates(data);
    });
  }

  useEffect(fetchArticles, []);

  return (
    <div className="main">
      <div className="top-section-container">
        <h1>China Feed</h1>
        <button className="refresh-button" onClick={handleClick}>
          Click here to refresh articles
        </button>
      </div>
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
            <tr key={index}>
              <td>
                <a href={links[index]}>{titles[index]}</a>
              </td>
              <td>{element}</td>
              <td>{entities[index]}</td>
              <td>{relevance[index]}</td>
            </tr>
          ))}
          <tr>
            <th colSpan={4}>Overall Summary</th>
          </tr>
          <tr>
            <td colSpan={4}>{summary}</td>
          </tr>
        </tbody>
      </table>
      <div></div>
    </div>
  );
}

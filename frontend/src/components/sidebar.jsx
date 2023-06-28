import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 style={{ color: "whitesmoke", marginTop: "21.44px" }}>Welcome!</h2>
      <div className="sidebar-button-container">
        <p>Individual Articles</p>
        <Link to="/translation">
          <button className="sidebar-button">Translation (CN to EN)</button>
        </Link>
        <Link to="/">
          <button className="sidebar-button">
            Individual Article (EN)
          </button>
        </Link>
        <p>RSS Feed Categories</p>
        <Link to="/infrastructure">
          <button className="sidebar-button">Infrastructure (fast)</button>
        </Link>
        <Link to="/infrastructureslow">
          <button className="sidebar-button">Infrastructure (slow)</button>
        </Link>
      </div>
      <p style={{ color: "whitesmoke" }}>ChatGPT Clone using OpenAI API</p>
    </div>
  );
}

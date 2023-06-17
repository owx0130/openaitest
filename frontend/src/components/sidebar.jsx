import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 style={{ color: "whitesmoke", marginTop: "21.44px" }}>Welcome!</h2>
      <div className="sidebar-button-container">
        <Link to="/">
          <button className="sidebar-button">Chatbot Function</button>
        </Link>
        <p>RSS Feed Categories</p>
        <Link to="/infrastructure">
          <button className="sidebar-button">Infrastructure</button>
        </Link>
      </div>
      <p style={{ color: "whitesmoke" }}>ChatGPT Clone using OpenAI API</p>
    </div>
  );
}

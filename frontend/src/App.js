import "./styles.css";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import Infrastructure from "./pages/Infrastructure";
import Space from "./pages/Space";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/infrastructure" element={<Infrastructure />} />
        <Route path="/space" element={<Space />} />
      </Routes>
    </>
  );
}

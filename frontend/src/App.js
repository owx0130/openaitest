import "./styles.css";
import Home from "./pages/Home";
import Infrastructure from "./pages/Infrastructure";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/infrastructure" element={<Infrastructure />} />
      </Routes>
    </>
  );
}

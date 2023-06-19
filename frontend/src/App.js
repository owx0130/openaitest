import "./styles.css";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import Infrastructure from "./pages/Infrastructure";
import InfrastructureSlow from "./pages/InfrastructureSlow";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/infrastructure" element={<Infrastructure />} />
        <Route path="/infrastructureslow" element={<InfrastructureSlow />} />
      </Routes>
    </>
  );
}

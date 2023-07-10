import AIFeed from "../components/aifeed";
import Sidebar from "../components/sidebar";

export default function AI() {
  return (
    <div className="app">
      <Sidebar />
      <AIFeed />
    </div>
  )
}
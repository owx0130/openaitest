import TranslationFeed from "../components/translationfeed";
import Sidebar from "../components/sidebar";

export default function Translation() {
  return (
    <div className="app">
      <Sidebar />
      <TranslationFeed />
    </div>
  )
}
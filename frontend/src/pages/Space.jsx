import SpaceFeed from "../components/spacefeed";
import Sidebar from "../components/sidebar";

export default function Space() {
  return (
    <div className="app">
      <Sidebar />
      <SpaceFeed />
    </div>
  )
}
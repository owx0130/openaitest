import InfrastructureFeed from "../components/infrastructurefeed";
import Sidebar from "../components/sidebar";

export default function Infrastructure() {
  return (
    <div className="app">
      <Sidebar />
      <InfrastructureFeed />
    </div>
  )
}
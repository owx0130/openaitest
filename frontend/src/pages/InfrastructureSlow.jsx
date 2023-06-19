import InfrastructureSlowFeed from "../components/infrastructureslowfeed";
import Sidebar from "../components/sidebar";

export default function InfrastructureSlow() {
  return (
    <div className="app">
      <Sidebar />
      <InfrastructureSlowFeed />
    </div>
  )
}
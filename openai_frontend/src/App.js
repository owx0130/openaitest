import './styles.css'
import Sidebar from './components/sidebar'
import Main from './components/main'

export default function App() {
  return(
    <div className="app">
      <Sidebar />
      <Main />
    </div>
  )
}
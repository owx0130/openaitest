import './styles.css'
import Sidebar from './components/sidebar'
import Main from './components/main'

export default function App() {
  return(
    <div style={{display:"flex"}}>
      <Sidebar />
      <Main />
    </div>
  )
}
export default function Sidebar() {
  return (
    <div className="sidebar">
      <button className="newChatButton">+ New Chat</button>
      <p style={{color:"whitesmoke", maxWidth: "75%"}}>If you want to use data from an online article, pass in the 
      full URL of the article as such: https://.....</p>
      <p style={{color:"whitesmoke"}}>ChatGPT Clone using OpenAI API</p>
    </div>
  )
}
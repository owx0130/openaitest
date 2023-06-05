import { useState, useEffect } from "react";
import Feed from "./feed";

export default function Main() {
  const [value, setValue] = useState("");
  const [reply, setReply] = useState("");
  const [prevChats, setPrevChats] = useState([])

  async function handleSubmit(event) {
    event.preventDefault();
    const options = {
      method: "POST",
      body: JSON.stringify({
        role: "user",
        content: value,
      }),
      headers: {
        "Content-type": "application/json",
      },
    };
    const response = await fetch("http://localhost:8000/completions", options);
    const data = await response.json();
    setReply(data.choices[0].message.content);
  }
  
  console.log(prevChats)

  useEffect(() => {
    if (value && reply) {
      setPrevChats((prevChats) => [
        ...prevChats,
        {
          role: "user",
          content: value,
        },
        {
          role: "assistant",
          content: reply,
        },
      ]);
      setValue("");
    }
  }, [reply]);

  return (
    <div className="main">
      <h1>Chat Completion Model</h1>
      <ul>
        {prevChats.map((element, index) => <Feed key={index} data={element} />)}
      </ul>
      <form className="bottom-section" onSubmit={(e) => handleSubmit(e)}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
        />
        <input type="submit" hidden />
      </form>
    </div>
  );
}

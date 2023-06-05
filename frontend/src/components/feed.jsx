export default function Feed({ data }) {
  return (
    <>
      {data.role==="user"? <h5>{data.role}: {data.content}</h5>:
      <h5 style={{color:"rgba(255,255,255,0.5)"}}>{data.role}: {data.content}</h5>}
    </>
  );
}

export default function Feed({ data }) {
  return (
    <>
      {data.role==="user"? <p style={{color:"black"}}>{data.role}: {data.content}</p>:
      <p>{data.role}: {data.content}</p>}
    </>
  );
}
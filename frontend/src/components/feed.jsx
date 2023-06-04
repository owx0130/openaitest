export default function Feed({ data }) {
  return (
    <>
      <h5>{data.role}: {data.content}</h5>
    </>
  );
}

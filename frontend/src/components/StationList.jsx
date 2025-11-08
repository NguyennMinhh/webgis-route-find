export default function StationList({ stations }) {
  if (!stations?.length) return <p>Đang tải trạm...</p>;

  return (
    <section>
      <h3>📍 Danh sách trạm</h3>
      <ul>
        {stations.map((s) => (
          <li key={s.id}>
            {s.name} ({s.code})
          </li>
        ))}
      </ul>
    </section>
  );
}

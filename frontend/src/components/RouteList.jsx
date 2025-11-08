import { Link } from "react-router-dom";

export default function RouteList({ routes }) {
  if (!routes?.length) return <p>Đang tải tuyến...</p>;

  return (
    <section>
      <h3>🛣️ Danh sách tuyến</h3>
      <ul>
        {routes.map((r) => (
          <li key={r.id}>
            <Link to={`/route/${r.route_code}`}>
              {r.name} — {r.route_code} ({r.direction})
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

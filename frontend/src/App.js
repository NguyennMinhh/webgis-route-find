import axios from "axios";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Fix lỗi icon marker mặc định ---
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
// -------------------------------------

function App() {
  const [stations, setStations] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Lấy toàn bộ dữ liệu từ API /maps/
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/maps/", {
        headers: { Accept: "application/json" },
      })
      .then((res) => {
        setStations(res.data.bus_stations || []);
        setRoutes(res.data.bus_routes || []);
      })
      .catch((err) => console.error("Lỗi khi tải dữ liệu:", err));
  }, []);

  // Hiển thị bản đồ Leaflet
  useEffect(() => {
    if (stations.length === 0 && routes.length === 0) return;

    // --- Parse WKT ---
    const parsePoint = (geomString) => {
      if (!geomString) return null;
      const match = geomString.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/);
      if (match) {
        const lng = parseFloat(match[1]);
        const lat = parseFloat(match[2]);
        return [lat, lng];
      }
      return null;
    };

    const parseLine = (geomString) => {
      if (!geomString) return [];
      const match = geomString.match(/LINESTRING\s*\((.+)\)/);
      if (!match) return [];
      return match[1].split(",").map((p) => {
        const [lng, lat] = p.trim().split(" ").map(Number);
        return [lat, lng];
      });
    };

    // --- Tạo bản đồ ---
    const center =
      stations.length > 0 ? parsePoint(stations[0].geom) : [21.03, 105.82];
    const map = L.map("map").setView(center, 14);

    // Layer nền
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
    }).addTo(map);

    // --- Vẽ các trạm ---
    stations.forEach((st) => {
      const coords = parsePoint(st.geom);
      if (coords) {
        L.marker(coords)
          .addTo(map)
          .bindPopup(`<b>${st.name || "Unnamed station"}</b><br>Mã: ${st.code}`);
      }
    });

    // --- Vẽ các tuyến ---
    routes.forEach((rt) => {
      const lineCoords = parseLine(rt.geom);
      if (lineCoords.length > 0) {
        L.polyline(lineCoords, {
          color: rt.direction === "go" ? "#1E90FF" : "#FF4500",
          weight: 8,
          opacity: 0.8,
        })
          .addTo(map)
          .bindPopup(
            `<b>${rt.name || "Unnamed route"}</b><br>Mã tuyến: ${
              rt.route_code
            }<br>Hướng: ${rt.direction}`
          );
      }
    });

    // Cleanup
    return () => map.remove();
  }, [stations, routes]);

  return (
    <div style={{ padding: "10px" }}>
      <h2>🚌 Bản đồ tuyến xe buýt</h2>

      <div
        id="map"
        style={{
          width: "100%",
          height: "580px",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      ></div>

      <h3>📍 Danh sách trạm</h3>
      {stations.length > 0 ? (
        <ul>
          {stations.map((s) => (
            <li key={s.id}>
              {s.name} ({s.code})
            </li>
          ))}
        </ul>
      ) : (
        <p>Đang tải trạm...</p>
      )}

      <h3>🛣️ Danh sách tuyến</h3>
      {routes.length > 0 ? (
        <ul>
          {routes.map((r) => (
            <li key={r.id}>
              {r.name} — {r.route_code} ({r.direction})
            </li>
          ))}
        </ul>
      ) : (
        <p>Đang tải tuyến...</p>
      )}
    </div>
  );
}

export default App;

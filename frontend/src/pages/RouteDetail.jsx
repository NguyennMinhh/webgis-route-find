import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRouteDetail } from "../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { parsePoint, parseLine } from "../utils/geomParser";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function RouteDetail() {
  const { route_code } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchRouteDetail(route_code);
        console.log("Response:", res);
        setData(res);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu tuyến:", err.message);
      }
    };
    load();
  }, [route_code]);

  useEffect(() => {
    if (!data) return;

    const map = L.map("map").setView([21.03, 105.82], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
    }).addTo(map);

    // Vẽ trạm
    data.bus_stations.forEach((st) => {
      const coords = parsePoint(st.geom);
      if (coords) L.marker(coords).addTo(map).bindPopup(`<strong>Order: </strong>${st.order} <br> <strong>Name: </strong>${st.name} <br> <strong>Id: </strong>${st.id}`);
    });

    // Vẽ tuyến có mũi tên hướng
    data.bus_routes.forEach((rt) => {
      const lineCoords = parseLine(rt.geom);
      if (lineCoords.length) {
        const color = rt.direction === "go" ? "#1E90FF" : "#FF4500"; // xanh: đi, đỏ: về
        const polyline = L.polyline(lineCoords, {
          color,
          weight: 6,
          opacity: 0.8,
        }).addTo(map);

        // Thêm mũi tên chỉ hướng di chuyển
        L.polylineDecorator(polyline, {
          patterns: [
            {
              offset: 25,
              repeat: 60,
              symbol: L.Symbol.arrowHead({
                pixelSize: 10,
                polygon: false,
                pathOptions: { color, weight: 2 },
              }),
            },
          ],
        }).addTo(map);

        // Popup tên tuyến
        polyline.bindPopup(
          `<strong>Order: </strong>${rt.order} <br> <strong>Name: </strong>${rt.name} (${rt.direction === "go" ? "Chiều đi" : "Chiều về"}) <br> <strong>Id: </strong> ${rt.id}`
        );
      }
    });

    return () => map.remove();
  }, [data]);

  if (!data) return <p>Đang tải tuyến {route_code}...</p>;

  return (
    <div>
      <h2>🚍 Tuyến {route_code}</h2>
      <div
        id="map"
        style={{
          width: "100%",
          height: "580px",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      ></div>

      <div style={{ marginBottom: "10px", fontSize: "14px" }}>
        <strong>Chú thích:</strong>{" "}
        <span style={{ color: "#1E90FF", fontWeight: "bold" }}>── Chiều đi</span>{" "}
        &nbsp;
        <span style={{ color: "#FF4500", fontWeight: "bold" }}>── Chiều về</span>
      </div>

      <h3>📍 Trạm của tuyến</h3>
      <ul>
        {data.bus_stations.map((s) => (
          <li key={s.id}>
            {s.name} ({s.code})
          </li>
        ))}
      </ul>
    </div>
  );
}

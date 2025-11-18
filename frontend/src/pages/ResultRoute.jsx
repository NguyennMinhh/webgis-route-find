import { useLocation } from "react-router-dom";
import { parseLine, parsePoint } from "../utils/geomParser";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { userIcon, goalLocation } from "../utils/icon";
import { useRef } from "react";

export default function ResultRoute() {
  const location = useLocation();
  const { resultRoute } = location.state || {};  // ← Sửa tên
  const mapRef = useRef(null)

  console.log("Dữ liệu nhận được:", resultRoute);

  useEffect(() => {
    if (!resultRoute || !resultRoute.stations) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map("result-map").setView([21.03, 105.82], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    if (resultRoute.user_location) {
      const [userLon, userLat] = resultRoute.user_location;
      L.marker([userLat, userLon], { icon: userIcon })
        .addTo(map)
        .bindPopup("<strong>Điểm xuất phát</strong>");
    }

    if (resultRoute.destination_location) {
      const [desLon, desLat] = resultRoute.destination_location;
      L.marker([desLat, desLon], { icon: goalLocation })
        .addTo(map)
        .bindPopup("<strong>Điểm cần đến</strong>");
    }

    // Vẽ các trạm
    resultRoute.stations.forEach((station) => {
      const coords = parsePoint(station.geom);
      if (coords) {
        L.marker(coords).addTo(map).bindPopup(
          `${station.name}<br>Order: ${station.order}`
        );
      }
    });

    // Vẽ các route (không vẽ route của trạm cuối)
    resultRoute.routes.forEach((route) => {
      const lineCoords = parseLine(route.geom);
      if (lineCoords.length) {
        const color = route.direction === "go" ? "#1E90FF" : "#FF4500"; // xanh: đi, đỏ: về
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
          `<strong>Order: </strong>${route.order} <br> <strong>Name: </strong>${route.name} (${route.direction === "go" ? "Chiều đi" : "Chiều về"}) <br> <strong>Id: </strong> ${route.id}`
        );
      }
    });

    return () => map.remove();
  }, [resultRoute]);

  

  if (!resultRoute) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>❌ Không có dữ liệu</h2>
        <p>Vui lòng chọn tuyến từ trang tìm kiếm</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>🚌 Chi tiết tuyến: {resultRoute.route_code}</h2>
      
      <div style={{ background: "#f0f8ff", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3>Thông tin chung</h3>
        <p><strong>📍 Trạm lên xe:</strong> {resultRoute.start_station.name} ({resultRoute.start_station.code})</p>
        <p><strong>🎯 Trạm xuống xe:</strong> {resultRoute.end_station.name} ({resultRoute.end_station.code})</p>
        <p><strong>🚶 Tổng quãng đi bộ:</strong> {resultRoute.total_walk_distance.toFixed(2)}m</p>
        <p><strong>🚏 Tổng số trạm:</strong> {resultRoute.total_stations} trạm</p>
      </div>

      {/* Bản đồ */}
      <div id="result-map" style={{ width: "100%", height: "500px", borderRadius: "8px", marginBottom: "20px" }}></div>

      {/* Danh sách trạm */}
      <h3>📍 Danh sách trạm sẽ đi qua:</h3>
      <ol>
        {resultRoute.stations.map((station) => (
          <li key={station.id} style={{ marginBottom: "10px" }}>
            <strong>{station.name}</strong> ({station.code})
            <br />
            <span style={{ fontSize: "12px", color: "#666" }}>Thứ tự: {station.order}</span>
          </li>
        ))}
      </ol>

      {/* Danh sách routes */}
      <h3>🗺️ Danh sách đoạn đường:</h3>
      <ul>
        {resultRoute.routes.map((route) => (
          <li key={route.id} style={{ marginBottom: "10px" }}>
            <strong>{route.name}</strong>
            <br />
            <span style={{ fontSize: "12px", color: "#666" }}>
              Hướng: {route.direction === "go" ? "Chiều đi" : "Chiều về"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
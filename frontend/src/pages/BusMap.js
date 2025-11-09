import { useEffect, useState } from "react";
import { fetchMapData } from "../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import UserLocation from "../components/UserLocation";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function BusMap() {
  const [stations, setStations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [map, setMap] = useState(null); // ⚡ giữ instance map

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMapData();
        setStations(data.bus_stations || []);
        setRoutes(data.bus_routes || []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      }
    };
    load();
  }, []);

  const parsePoint = (geom) => {
    const match = geom?.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/);
    if (!match) return null;
    const [lng, lat] = [parseFloat(match[1]), parseFloat(match[2])];
    return [lat, lng];
  };

  const parseLine = (geom) => {
    const match = geom?.match(/LINESTRING\s*\((.+)\)/);
    if (!match) return [];
    return match[1]
      .split(",")
      .map((p) => p.trim().split(" ").map(Number))
      .map(([lng, lat]) => [lat, lng]);
  };

  useEffect(() => {
    if (!stations.length && !routes.length) return;

    const center = stations.length > 0 ? parsePoint(stations[0].geom) : [21.03, 105.82];
    const newMap = L.map("map").setView(center, 13);
    setMap(newMap);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
    }).addTo(newMap);

    stations.forEach((st) => {
      const coords = parsePoint(st.geom);
      if (coords)
        L.marker(coords)
          .addTo(newMap)
          .bindPopup(`${st.name} (${st.code})`);
    });

    routes.forEach((rt) => {
      const lineCoords = parseLine(rt.geom);
      if (lineCoords.length)
        L.polyline(lineCoords, {
          color: rt.direction === "go" ? "#1E90FF" : "#FF4500",
          weight: 6,
          opacity: 0.7,
        })
          .addTo(newMap)
          .bindPopup(`${rt.name} (${rt.route_code})`);
    });

    return () => newMap.remove();
  }, [stations, routes]);

  return (
    <div>
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

      {/* ✅ Đặt ở đây mới đúng */}
      {map && map._loaded && <UserLocation map={map} />}

      <h3>📍 Danh sách trạm</h3>
      {stations.length ? (
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
      {routes.length ? (
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

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView({ stations, routes }) {
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
    if (!stations?.length && !routes?.length) return;

    const center =
      stations.length > 0 ? parsePoint(stations[0].geom) : [21.03, 105.82];
    const map = L.map("map").setView(center, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
    }).addTo(map);

    stations.forEach((st) => {
      const coords = parsePoint(st.geom);
      if (coords) {
        L.marker(coords)
          .addTo(map)
          .bindPopup(`<b>${st.name}</b><br>Mã: ${st.code}`);
      }
    });

    routes.forEach((rt) => {
      const lineCoords = parseLine(rt.geom);
      if (lineCoords.length > 0) {
        L.polyline(lineCoords, {
          color: rt.direction === "go" ? "#1E90FF" : "#FF4500",
          weight: 6,
        })
          .addTo(map)
          .bindPopup(`${rt.name} (${rt.route_code})`);
      }
    });

    return () => map.remove();
  }, [stations, routes]);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "580px",
        marginBottom: "20px",
        borderRadius: "8px",
      }}
    />
  );
}

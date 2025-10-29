import axios from "axios";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Fix lỗi icon marker trong React ---
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
// ----------------------------------------

function App() {
  const [users, setUsers] = useState([]);
  const [userLocations, setUserLocations] = useState([]);

  // Lấy dữ liệu từ Django
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/maps/user/", {
        headers: { Accept: "application/json" },
      })
      .then((res) => {
        setUsers(res.data);
        const latitude = res.data[0].latitude;
        const longitude = res.data[0].longitude;
        setUserLocations({ latitude, longitude });
      })
      .catch((err) => console.error("Error fetching user maps:", err));
  }, []);

  // Tạo bản đồ sau khi có dữ liệu
  useEffect(() => {
    if (users.length > 0) {
      const map = L.map("map").setView([userLocations.latitude, userLocations.longitude], 13);

      // Layer nền OSM
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
      }).addTo(map);

      // Marker cho từng user
      users.forEach((u) => {
        if (u.latitude && u.longitude) {
          L.marker([u.latitude, u.longitude])
            .addTo(map)
            .bindPopup(`<b>${u.username}</b><br>Age: ${u.age}`);
        }
      });

      // Cleanup map khi component unmount (tránh lỗi render lại)
      return () => map.remove();
    }
  }, [users]);

  return (
    <div style={{ padding: "10px" }}>
      <h2>User Map</h2>
      <div
        id="map"
        style={{
          width: "900px",
          height: "580px",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      ></div>

      <h3>User List</h3>
      {users.length > 0 ? (
        users.map((u) => (
          <p key={u.id}>
            {u.username} — {u.age}
          </p>
        ))
      ) : (
        <p>Loading users...</p>
      )}
    </div>
  );
}

export default App;

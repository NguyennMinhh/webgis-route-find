import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";
import { useEffect, useState } from "react";
import { fetchMapData, sendLocationDataToBackend } from "../services/api";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { parsePoint, parseLine } from "../utils/geomParser";
import { userIcon, busStationIcon } from "../utils/icon";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow, // ✅ sửa lại đúng key
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function BusMap() {
  const [data, setData] = useState(null);
  const [map, setMap] = useState(null)
  
  const [destinationMode, setDestinationMode] = useState(false)
  const [destination, setDestination] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const [routeResult, setRouteResult] = useState(null);

  
  // Lấy dữ liệu API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMapData();
        console.log("Response: ", res);
        setData(res);
      } catch (err) {
        console.log("Error: ", err.message);
      }
    };
    load();
  }, []);

// Vẽ bản đồ:
  useEffect(() => {
    if (!data) return;
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    const map = L.map(mapContainer).setView([21.03, 105.82], 13); // ✅ fix tọa độ
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
    }).addTo(map);

    // Vẽ trạm:
    data.bus_stations.forEach((station) => {
      const coords = parsePoint(station.geom);
      if (coords)
        L.marker(coords, { icon:busStationIcon }).addTo(map).bindPopup(`<strong>Name</strong>: ${station.name} - <strong>Code</strong>: ${station.code}`)
    });

    // Vẽ tuyến:
    data.bus_routes.forEach((route) => {
      const lineCoords = parseLine(route.geom);
      if (lineCoords.length) {
        // Chỉnh màu route:
        let color = null
        if (route.direction === "go") { color = "#1E90FF"; } 
        else if (route.direction === "return") { color = "#FF4500"; }
        const polyline = L.polyline(lineCoords, {
          color,
          weight: 6,
          opacity: 0.8,
        }).addTo(map);

        // Popup thông tin tuyến:
        polyline.bindPopup(
          `<strong>Name</strong>:${route.name} - <strong>Route Code</strong>:${route.route_code}`
        );
      }
    })

    setMap(map);

    // Xoá bản đồ:
    return () => map.remove();
  }, [data]);

  
  // thêm vị trí người dùng:
const addUserLocation = () => {
  if (!map) return alert("Map chưa sẵn sàng!");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude})
      L.marker([latitude, longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>Bạn đang ở đây!</b>")
        .openPopup();

      // Zoom tới vị trí
      map.setView([latitude, longitude], 15);
    },
    (error) => {
      console.log("Lỗi: ", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
};

  // Thông tin vị trí hiện tại của User
  useEffect(() => {
    console.log("User Location: ", userLocation)
  }, [userLocation])


  // Lấy vị trí điểm muốn đến
  useEffect(() => {
    if(!map || !destinationMode) return;

    const handleClick = (event) => {
      const { lat, lng } = event.latlng;
      setDestination({ lat, lng });
    };

    map.on("click", handleClick);
    return () => map.off("click", handleClick)
  }, [map, destinationMode])
  
  useEffect(() => {
    if (!map || !destination) return; 
    console.log("Destination Location: ", destination)
    const marker = L.marker([destination.lat, destination.lng])
      .addTo(map)
      .bindPopup("<b>Điểm Cần Đến!</b>")

    return () => map.removeLayer(marker);
  }, [destination, map])

  // demo:

  if (!data) return <p>Đang tải bản đồ...</p>;

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      {/* Cột trái: Bản đồ */}
      <div
        id="map"
        style={{
          flex: "0 0 70%", // chiếm 70%
          height: "53rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      ></div>

      {/* Cột phải: Panel thông tin */}
      <div
        style={{
          flex: "0 0 30%", // chiếm 30%
          background: "#fff",
          borderRadius: "8px",
          border: "1px solid #ddd",
          padding: "1rem",
          overflowY: "auto",
          height: "53rem",
        }}
      >
        <h3>Kết quả tuyến đường</h3>
        {routeResult && (
          <p>
            <strong>Bán kính tìm trạm: </strong> {routeResult.buffer_meter} m
          </p>
        )} 
        {!routeResult ? (
          <p>Chưa có dữ liệu.</p>
        ) : (
          <>
            <p>
              <strong>Các tuyến khả dụng:</strong>{" "}
              {routeResult.qualified_routes?.join(", ") ||
                "Không có tuyến phù hợp"}
            </p>
            <hr />
            <h4>Trạm gần bạn</h4>
            <ul>
              {routeResult.stations_near_user?.map((s) => (
                <li key={s.id}>
                  {s.name} ({s.code})
                </li>
              ))}
            </ul>
            <h4>Trạm gần điểm đến</h4>
            <ul>
              {routeResult.stations_near_destination?.map((s) => (
                <li key={s.id}>
                  {s.name} ({s.code}) - <strong> {s.straight_distance} m </strong>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Nút điều khiển */}
        <div style={{ marginTop: "1rem" }}>
          <button onClick={addUserLocation}>Lấy vị trí người dùng</button>
          <button onClick={() => setDestinationMode(!destinationMode)}>
            {destinationMode
              ? "🟡 Chế độ chọn điểm đến đang bật"
              : "🟥 Chế độ chọn điểm đến đang tắt"}
          </button>
          <button
            disabled={!userLocation || !destination}
            style={{
              opacity: !userLocation || !destination ? 0.5 : 1,
              marginTop: "0.5rem",
            }}
            onClick={async () => {
              if (!userLocation || !destination)
                return alert("Thiếu vị trí người dùng hoặc điểm đến");
              try {
                const res = await sendLocationDataToBackend(
                  userLocation.latitude,
                  userLocation.longitude,
                  destination.lat,
                  destination.lng
                );
                console.log("Server response:", res);
                setRouteResult(res);
              } catch (err) {
                console.error("Lỗi khi gửi:", err);
                alert("Không gửi được dữ liệu.");
              }
            }}
          >
            Gửi vị trí lên server
          </button>
        </div>
      </div>
    </div>
  );
}

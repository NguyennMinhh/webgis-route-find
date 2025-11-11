import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";
import { useEffect, useState } from "react";
import { fetchMapData } from "../services/api";

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
  const [userLocation, setUserLocation] = useState(null);

  const [destinationMode, setDestinationMode] = useState(false)
  const [destination, setDestination] = useState(null);
  
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
      setUserLocation(position)
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

  // // Thông tin vị trí hiện tại của User
  // useEffect(() => {
  //   console.log("User Location: ", userLocation)
  // }, [userLocation])


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


  if (!data) return <p>Đang tải bản đồ...</p>;

  return (
    <div>
      <div
        id="map"
        style={{
          width: "100%",
          height: "53rem",
          borderRadius: "8px",
        }}
      ></div>
      <button onClick={addUserLocation}>Lấy vị trí người dùng</button>
      <button onClick={() => {setDestinationMode(!destinationMode)}}>
        {destinationMode ? "🟡 Chế độ chọn điểm đến đang bật" : "🟥 Chế độ chọn điểm đến đang tắt"}
      </button>
    </div>
  );
}

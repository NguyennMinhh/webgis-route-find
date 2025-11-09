import { useEffect, useState } from "react";
import L from "leaflet";

export default function UserLocation({ map }) {
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (!map || !map.getContainer()) return; // map chưa tồn tại

    // Hàm cập nhật vị trí người dùng
    const updateUserPosition = (pos) => {
      const { latitude, longitude } = pos.coords;
      const latlng = [latitude, longitude];

      // Nếu chưa có marker thì tạo mới
      if (!marker) {
        const newMarker = L.marker(latlng)
          .addTo(map)
          .bindPopup("Vị trí hiện tại của bạn");
        setMarker(newMarker);
        map.setView(latlng, 15);
      } else {
        // Nếu có rồi, chỉ cập nhật vị trí
        marker.setLatLng(latlng);
      }
    };

    const errorHandler = (err) => {
      console.warn("Không thể lấy vị trí:", err);
    };

    // Lấy vị trí người dùng
    const watcher = navigator.geolocation.watchPosition(updateUserPosition, errorHandler, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    });

    // Dọn dẹp khi unmount
    return () => {
      navigator.geolocation.clearWatch(watcher);
      if (map && map.getContainer() && marker && map.hasLayer(marker)) {
        map.removeLayer(marker); // xóa marker nếu còn tồn tại
      }
    };
  }, [map, marker]);

  return null;
}

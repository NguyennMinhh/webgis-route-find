import { useEffect } from "react";
import L from "leaflet";

export default function UserLocation({ map }) {
  useEffect(() => {
    if (!map) return; // Chờ map load xong (Leaflet instance truyền từ cha)

    let marker = null;
    let circle = null;

    // Hàm cập nhật vị trí
    const updatePosition = (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      console.log(`📍 Your position: ${lat}, ${lng} (±${accuracy}m)`);

      if (!marker) {
        // Lần đầu tiên tạo marker và circle
        marker = L.marker([lat, lng]).addTo(map).bindPopup("📍 Bạn đang ở đây");
        circle = L.circle([lat, lng], { radius: accuracy, color: "#136aec", fillOpacity: 0.2 }).addTo(map);
        map.setView([lat, lng], 15);
      } else {
        // Cập nhật liên tục
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        circle.setRadius(accuracy);
      }
    };

    // Hàm lỗi
    const onError = (err) => {
      console.error("❌ Không thể lấy vị trí:", err.message);
      alert("Không thể truy cập vị trí của bạn. Hãy bật quyền định vị (location).");
    };

    // Theo dõi vị trí theo thời gian thực
    const watchId = navigator.geolocation.watchPosition(updatePosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000,
    });

    // Cleanup khi component unmount
    return () => navigator.geolocation.clearWatch(watchId);
  }, [map]);

  return null; // Không render UI
}

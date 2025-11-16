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
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function BusMap() {
  const [data, setData] = useState(null);
  const [map, setMap] = useState(null);

  const [destinationMode, setDestinationMode] = useState(false);
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

    const map = L.map(mapContainer).setView([21.03, 105.82], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
    }).addTo(map);

    // Vẽ trạm:
    data.bus_stations.forEach((station) => {
      const coords = parsePoint(station.geom);
      if (coords)
        L.marker(coords, { icon: busStationIcon })
          .addTo(map)
          .bindPopup(
            `<strong>Name</strong>: ${station.name} - <strong>Code</strong>: ${station.code}`
          );
    });

    // Vẽ tuyến:
    data.bus_routes.forEach((route) => {
      const lineCoords = parseLine(route.geom);
      if (lineCoords.length) {
        let color = null;
        if (route.direction === "go") {
          color = "#1E90FF";
        } else if (route.direction === "return") {
          color = "#FF4500";
        }
        const polyline = L.polyline(lineCoords, {
          color,
          weight: 6,
          opacity: 0.8,
        }).addTo(map);

        polyline.bindPopup(
          `<strong>Name</strong>:${route.name} - <strong>Route Code</strong>:${route.route_code}`
        );
      }
    });

    setMap(map);

    return () => map.remove();
  }, [data]);

  // Thêm vị trí người dùng:
  const addUserLocation = () => {
    if (!map) return alert("Map chưa sẵn sàng!");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup("<b>Bạn đang ở đây!</b>")
          .openPopup();

        map.setView([latitude, longitude], 15);
      },
      (error) => {
        console.log("Lỗi: ", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    console.log("User Location: ", userLocation);
  }, [userLocation]);

  // Lấy vị trí điểm muốn đến
  useEffect(() => {
    if (!map || !destinationMode) return;

    const handleClick = (event) => {
      const { lat, lng } = event.latlng;
      setDestination({ lat, lng });
    };

    map.on("click", handleClick);
    return () => map.off("click", handleClick);
  }, [map, destinationMode]);

  useEffect(() => {
    if (!map || !destination) return;
    console.log("Destination Location: ", destination);
    const marker = L.marker([destination.lat, destination.lng])
      .addTo(map)
      .bindPopup("<b>Điểm Cần Đến!</b>");

    return () => map.removeLayer(marker);
  }, [destination, map]);

  // Hàm zoom đến trạm khi click vào tên
  const zoomToStation = (stationName) => {
    if (!map || !data) return;
    
    const station = data.bus_stations.find(s => s.name === stationName);
    if (!station) return;
    
    const coords = parsePoint(station.geom);
    if (!coords) return;
    
    // Zoom đến trạm với animation
    map.setView(coords, 17, { animate: true, duration: 1 });
    
    // Highlight trạm bằng circle
    const circle = L.circle(coords, {
      color: '#FF4500',
      fillColor: '#FF6347',
      fillOpacity: 0.3,
      radius: 50
    }).addTo(map);
    
    // Tìm và mở popup của trạm
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const popupContent = layer.getPopup()?.getContent();
        if (popupContent && popupContent.includes(station.code)) {
          setTimeout(() => layer.openPopup(), 500);
        }
      }
    });
    
    // Xóa circle sau 3 giây
    setTimeout(() => map.removeLayer(circle), 3000);
  };

  if (!data) return <p>Đang tải bản đồ...</p>;

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      {/* Cột trái: Bản đồ */}
      <div
        id="map"
        style={{
          flex: "0 0 70%",
          height: "53rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      ></div>

      {/* Cột phải: Panel thông tin */}
      <div
        style={{
          flex: "0 0 30%",
          background: "#fff",
          borderRadius: "8px",
          border: "1px solid #ddd",
          padding: "1rem",
          overflowY: "auto",
          height: "53rem",
        }}
      >
        {/* Nút điều khiển */}
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={addUserLocation}
            style={{
              padding: "10px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            📍 Lấy vị trí của tôi
          </button>

          <button
            onClick={() => setDestinationMode(!destinationMode)}
            style={{
              padding: "10px",
              background: destinationMode ? "#FFA500" : "#ccc",
              color: destinationMode ? "white" : "#666",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {destinationMode ? "🟡 Đang chọn điểm đến" : "⚪ Bật chế độ chọn điểm đến"}
          </button>

          <button
            disabled={!userLocation || !destination}
            style={{
              padding: "10px",
              background:
                !userLocation || !destination ? "#ddd" : "#2196F3",
              color: !userLocation || !destination ? "#999" : "white",
              border: "none",
              borderRadius: "6px",
              cursor: !userLocation || !destination ? "not-allowed" : "pointer",
              fontWeight: "bold",
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
            🔍 Tìm tuyến xe buýt
          </button>
        </div>
        
        {/* Hiển thị thông tin */}
        <h3>🔍 Kết quả tìm kiếm tuyến</h3>

        {!routeResult ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem 1rem",
              color: "#666",
            }}
          >
            <p>Chưa có dữ liệu tìm kiếm.</p>
            <p style={{ fontSize: "14px" }}>
              👆 Nhấn nút bên trên để bắt đầu
            </p>
          </div>
        ) : (
          <>
            {/* Thông tin chung */}
            <div
              style={{
                background: "#e8f5e9",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "1rem",
              }}
            >
              <p style={{ margin: "4px 0", fontSize: "14px" }}>
                <strong>📏 Bán kính:</strong> {routeResult.buffer_meter}m
              </p>
              <p style={{ margin: "4px 0", fontSize: "14px" }}>
                <strong>🚌 Tuyến khả dụng:</strong>{" "}
                {routeResult.qualified_routes?.length > 0
                  ? routeResult.qualified_routes.join(", ")
                  : "Không có"}
              </p>
            </div>

            {/* Tuyến tốt nhất */}
            {routeResult.shortest_obj && (
              <div style={{ 
                border: "2px solid #4CAF50", 
                borderRadius: "8px", 
                padding: "12px", 
                marginBottom: "1rem", 
                background: "#f1f8f4" 
              }}>
                <h4 style={{ 
                  margin: "0 0 10px 0", 
                  color: "#2E7D32", 
                  fontSize: "20px" 
                }}>
                  ⭐ Tuyến tốt nhất: {routeResult.shortest_obj.route_code}
                </h4>
                
                <div style={{ background: "#fff", padding: "10px", borderRadius: "4px", marginTop: "10px" }}>
                  <p style={{ margin: "4px 0", fontSize: "14px", fontWeight: "bold", color: "#1976D2" }}>
                    🚶 Tổng quãng đi bộ: {routeResult.shortest_obj.total_walk_distance.toFixed(2)}m
                  </p>
                  
                  <hr style={{ margin: "10px 0", border: "none", borderTop: "1px solid #ddd" }} />
                  
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ margin: "4px 0 6px 0", fontSize: "14px", fontWeight: "bold" }}>
                      📍 Trạm gần bạn nhất:
                    </p>
                    {routeResult.shortest_obj.stations_near_user?.length > 0 ? (
                      <div>
                        <p 
                          style={{ 
                            margin: "2px 0 2px 10px", 
                            fontSize: "13px",
                            cursor: "pointer",
                            color: "#1976D2",
                            textDecoration: "underline"
                          }}
                          onClick={() => zoomToStation(routeResult.shortest_obj.stations_near_user[0].name)}
                          title="Click để xem trạm trên bản đồ"
                        >
                          <strong>{routeResult.shortest_obj.stations_near_user[0].name}</strong> ({routeResult.shortest_obj.stations_near_user[0].code})
                        </p>
                        <p style={{ margin: "0 0 0 10px", fontSize: "11px", color: "#666" }}>
                          → Đi bộ {routeResult.shortest_obj.stations_near_user[0].straight_distance}m
                          {routeResult.shortest_obj.stations_near_user[0].order && 
                            ` • Order: ${routeResult.shortest_obj.stations_near_user[0].order}`
                          }
                        </p>
                      </div>
                    ) : (
                      <p style={{ margin: "0 0 0 10px", fontSize: "12px", color: "#999" }}>Không có trạm</p>
                    )}
                  </div>
                  
                  <div>
                    <p style={{ margin: "4px 0 6px 0", fontSize: "14px", fontWeight: "bold" }}>
                      🎯 Trạm gần điểm đến nhất:
                    </p>
                    {routeResult.shortest_obj.stations_near_destination?.length > 0 ? (
                      <div>
                        <p 
                          style={{ 
                            margin: "2px 0 2px 10px", 
                            fontSize: "13px",
                            cursor: "pointer",
                            color: "#1976D2",
                            textDecoration: "underline"
                          }}
                          onClick={() => zoomToStation(routeResult.shortest_obj.stations_near_destination[0].name)}
                          title="Click để xem trạm trên bản đồ"
                        >
                          <strong>{routeResult.shortest_obj.stations_near_destination[0].name}</strong> ({routeResult.shortest_obj.stations_near_destination[0].code})
                        </p>
                        <p style={{ margin: "0 0 0 10px", fontSize: "11px", color: "#666" }}>
                          → Đi bộ {routeResult.shortest_obj.stations_near_destination[0].straight_distance}m
                          {routeResult.shortest_obj.stations_near_destination[0].order && 
                            ` • Order: ${routeResult.shortest_obj.stations_near_destination[0].order}`
                          }
                        </p>
                      </div>
                    ) : (
                      <p style={{ margin: "0 0 0 10px", fontSize: "12px", color: "#999" }}>Không có trạm</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Hiển thị chi tiết từng tuyến */}
            <h4 style={{ fontSize: "16px", marginBottom: "10px", marginTop: "1rem" }}>
              Tất cả các tuyến phù hợp:
            </h4>
            {routeResult.qualified_stations?.map((routeData, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "1rem",
                  background: routeData.route_code === routeResult.shortest_obj?.route_code ? "#f1f8f4" : "#fff",
                }}
              >
                {/* Header tuyến */}
                <h4
                  style={{
                    margin: "0 0 10px 0",
                    color: "#1E90FF",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "18px"
                  }}
                >
                  🚌 Tuyến {routeData.route_code}
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    ({routeData.total_walk_distance.toFixed(2)}m)
                  </span>
                </h4>

                {/* Trạm gần người dùng - HIỂN THỊ TẤT CẢ THEO ORDER */}
                <div style={{ marginBottom: "12px" }}>
                  <p
                    style={{
                      fontWeight: "bold",
                      margin: "8px 0 6px 0",
                      fontSize: "13px",
                    }}
                  >
                    📍 Trạm gần bạn (theo thứ tự):
                  </p>
                  {routeData.stations_near_user?.length > 0 ? (
                    <ol
                      style={{
                        margin: 0,
                        paddingLeft: "20px",
                        fontSize: "12px",
                      }}
                    >
                      {/* Sort theo order trước khi hiển thị */}
                      {[...routeData.stations_near_user]
                        .sort((a, b) => (a.order || 999) - (b.order || 999))
                        .map((station) => (
                        <li key={station.id} style={{ marginBottom: "4px" }}>
                          <span
                            style={{
                              cursor: "pointer",
                              color: "#1976D2",
                              textDecoration: "underline"
                            }}
                            onClick={() => zoomToStation(station.name)}
                            title="Click để xem trạm trên bản đồ"
                          >
                            <strong>{station.name}</strong> ({station.code})
                          </span>
                          <br />
                          <span style={{ color: "#666", fontSize: "11px" }}>
                            ↔ {station.straight_distance}m
                            {station.order && ` • Thứ tự: ${station.order}`}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p style={{ color: "#999", fontSize: "12px", marginLeft: "10px" }}>
                      Không có trạm
                    </p>
                  )}
                </div>

                {/* Trạm gần điểm đến - HIỂN THỊ TẤT CẢ THEO ORDER */}
                <div>
                  <p
                    style={{
                      fontWeight: "bold",
                      margin: "8px 0 6px 0",
                      fontSize: "13px",
                    }}
                  >
                    🎯 Trạm gần điểm đến (theo thứ tự):
                  </p>
                  {routeData.stations_near_destination?.length > 0 ? (
                    <ol
                      style={{
                        margin: 0,
                        paddingLeft: "20px",
                        fontSize: "12px",
                      }}
                    >
                      {/* Sort theo order trước khi hiển thị */}
                      {[...routeData.stations_near_destination]
                        .sort((a, b) => (a.order || 999) - (b.order || 999))
                        .map((station) => (
                        <li key={station.id} style={{ marginBottom: "4px" }}>
                          <span
                            style={{
                              cursor: "pointer",
                              color: "#1976D2",
                              textDecoration: "underline"
                            }}
                            onClick={() => zoomToStation(station.name)}
                            title="Click để xem trạm trên bản đồ"
                          >
                            <strong>{station.name}</strong> ({station.code})
                          </span>
                          <br />
                          <span style={{ color: "#666", fontSize: "11px" }}>
                            ↔ {station.straight_distance}m
                            {station.order && ` • Thứ tự: ${station.order}`}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p style={{ color: "#999", fontSize: "12px", marginLeft: "10px" }}>
                      Không có trạm
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Nếu không có tuyến nào */}
            {routeResult.qualified_stations?.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem 1rem",
                  color: "#d32f2f",
                }}
              >
                <p>❌ Không tìm thấy tuyến phù hợp</p>
                <p style={{ fontSize: "13px" }}>
                  Thử tăng bán kính tìm kiếm hoặc chọn điểm khác
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
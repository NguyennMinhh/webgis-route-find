import L from "leaflet";
import userIconURL from "../assets/icons/user.png";
import BusStationIconURL from "../assets/icons/bus_station.png"

// Icon mặc định cho trạm bus
export const busStationIcon = L.icon({
  iconUrl: BusStationIconURL,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});

// Icon vị trí người dùng
export const userIcon = L.icon({
  iconUrl: userIconURL,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -35],
});

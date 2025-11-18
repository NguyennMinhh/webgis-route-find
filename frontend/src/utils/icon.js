import L from "leaflet";
import userIconURL from "../assets/icons/user.png";
import BusStationIconURL from "../assets/icons/bus_station.png"
import GoalDestinationURL from "../assets/icons/goal_destination.png"

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

export const goalLocation = L.icon({
  iconUrl: GoalDestinationURL,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -35],
})

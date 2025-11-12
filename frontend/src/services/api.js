import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export const fetchMapData = async () => {
  const res = await axios.get(`${API_BASE}/maps/`);
  return res.data;
};

export const fetchRouteDetail = async (routeCode) => {
  const res = await axios.get(`${API_BASE}/maps/route/${routeCode}/`, {
    headers: { Accept: "application/json" },
  });
  return res.data;
};

export const fetchRouteCodeList = async() => {
    const res = await axios.get(`${API_BASE}/maps/route/code_list/`);
    return res.data;
}

  // Gửi vị trí người dùng và vị trí muốn đến lên backend:
export const sendLocationDataToBackend = async (
  startLat, 
  startLng, 
  endLat, 
  endLng, 
  // APIurl = "/"
) => {
  if (!startLat || !startLng || !endLat || !endLng) {
    alert("Thiếu dữ liệu vị trí user hoặc destination");
    return;
  }

  // if (!APIurl) {
  //   alert("Thiếu dữ liệu url để gửi");
  //   return;
  // }

  const data = {
    start_lat: startLat,
    start_long: startLng,
    end_lat: endLat,
    end_long: endLng,
  }

  console.log("Posted data: ", data)

  const res = await axios.post(`${API_BASE}/maps/`, data, {
    headers: { "Content-Type": "application/json" },
  });

  return res.data;
}

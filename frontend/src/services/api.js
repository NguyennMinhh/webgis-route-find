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

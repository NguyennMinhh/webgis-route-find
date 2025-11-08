import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchRouteCodeList } from "../services/api";

function Navbar() {
  const [routeCodeList, setRouteCodeList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchRouteCodeList();
        setRouteCodeList(data || []);
      } catch (err) {
        console.error("Lỗi khi tải route codes:", err);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value) navigate(`/route/${value}/`);
  };

  return (
    <nav
      style={{
        padding: "10px",
        background: "#f2f2f2",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <Link to="/" style={{ textDecoration: "none", color: "black" }}>
        Trang chủ
      </Link>

      <div>
        <label htmlFor="route-select" style={{ marginRight: "6px" }}>
        </label>
        <select
          id="route-select"
          onChange={handleChange}
          defaultValue=""
          style={{
            padding: "5px 8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          <option value="">-- Chọn tuyến xe buýt --</option>
          {routeCodeList.map((code) => (
            <option key={code} value={code}>
              Tuyến {code}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}

export default Navbar;

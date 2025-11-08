import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BusMap from "./pages/BusMap";
import RouteDetail from "./pages/RouteDetail";

export default function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: "10px" }}>
        <Routes>
          <Route path="/" element={<BusMap />} />
          <Route path="/route/:route_code" element={<RouteDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

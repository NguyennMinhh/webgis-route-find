import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";

export const parsePoint = (geom) => {
    const match = geom?.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/);
    if (!match) return null;
    const [lng, lat] = [parseFloat(match[1]), parseFloat(match[2])];
    return [lat, lng]
}

export const parseLine = (geom) => {
    const match = geom?.match(/LINESTRING\s*\((.+)\)/);
    if (!match) return [];
    return match[1]
            .split(", ")
            .map((p) => p.trim().split(" ").map(Number))
            .map(([lng, lat]) => [lat, lng]);
}
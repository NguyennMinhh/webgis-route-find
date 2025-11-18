import requests

def get_route_geom(lat1, lon1, lat2, lon2):
    url = f"http://localhost:5000/route/v1/walking/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson"

    response = requests.get(url)
    data = response.json()

    if "routes" not in data or len(data["routes"]) == 0:
        return None

    route = data["routes"][0]
    return {
        "distance": route["distance"],
        "duration": route["duration"],
        "geometry": route["geometry"],  # LineString GeoJSON
    }

from django.http import HttpResponse
from rest_framework.response import Response
from django.shortcuts import render
from .models import User, BusRoute, BusStation
from maps.serializers import UserSerializer, MapSerializer, RouteCodeSerializer
from rest_framework import generics
from rest_framework.views import APIView
from django.contrib.gis.geos import Point


class UserListApiView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class MapView(APIView):
    def get(self, request):
        data = {
            "bus_routes": BusRoute.objects.all(),
            "bus_stations": BusStation.objects.all(),
            "users": User.objects.all(),
        }
        serializer = MapSerializer(data)
        return Response(serializer.data)

    def post(self, request):
        start_lat = float(request.data.get("start_lat"))
        start_long = float(request.data.get("start_long"))
        end_lat = float(request.data.get("end_lat"))
        end_long = float(request.data.get("end_long"))

        # (W.I.P): Dùng buffer để tìm các trạm phù hợp: (1 km = 0.009)
        meter_radius = 20000
        radius = meter_radius / 111000   # vì là hệ toạ độ 4326 nên cần đổi 500m sang 0.0045 độ - 20km

        user_location = Point(start_long, start_lat, srid=4326)
        destination_location = Point(end_long, end_lat, srid=4326)

        user_buffer = user_location.buffer(radius)
        destination_buffer = destination_location.buffer(radius)

        stations_near_user = BusStation.objects.filter(geom__within=user_buffer)
        stations_near_destination = BusStation.objects.filter(
            geom__within=destination_buffer
        )

        print(f"----- 1, Stations_near_user: {stations_near_user}")
        print(f"----- 2, Stations_near_destination: {stations_near_destination}")

        # Lọc bus_station bằng bus_route trùng mã
        user_route_codes = (
            BusRoute.objects.filter(route_stations__station__in=stations_near_user)
            .values_list("route_code", flat=True)
            .distinct()
        )
        dest_route_codes = (
            BusRoute.objects.filter(
                route_stations__station__in=stations_near_destination
            )
            .values_list("route_code", flat=True)
            .distinct()
        )
        qualified_route_codes = (
            BusRoute.objects
            .filter(route_code__in=user_route_codes)
            .filter(route_code__in=dest_route_codes)
            .order_by('route_code')
            .distinct('route_code')
            .values_list('route_code', flat=True)
        )

        print(f"----- 3, user_route_codes: {user_route_codes}")
        print(f"----- 4, dest_route_codes: {dest_route_codes}")
        print(f"----- 5, qualified_route_codes: {qualified_route_codes}")
        # -End (WIP)
        
        # # Ý tưởng
        # Nếu trong khoảng cách duration, nếu có 2 trạm nào có bus_route trùng mã route_code thì đi trạm đó có thể đi được
        # Nếu có nhiều trạm có thể đi được trong các route đó thì tìm trạm gần nhất bằng cách tìm khoảng cách cò bay với các trạm trong từng route, trạm nào được chọn thì dùng OSRM API để tạo tuyến đường đi
        # Hiển thị tuyến đường đi đó cùng các bus_route có order từ trạm bus_station start đến trạm bus_station end

        # Sau khi tìm đc 2 trạm để đi và xuống
        # Từ 2 bảng bus_station đó tìm ra 2 bảng RouteBus tương ứng, qua đó lấy được order, vd: order: 1 và order: 5, sau đó lấy các route có order từ 1 => 5 sẽ là tuyến route xe buýt mà người đi xe buýt đi qua
        # Tiếp đó 
        # #
 
        return Response({
            "message": "Dữ liệu đã nhận.",
            "buffer_meter": round(radius * 111_000, 2),  # đổi độ sang mét, 1 độ = 111.000m
            "qualified_routes": qualified_route_codes,
            "stations_near_user": [
                {"id": station.id, "name": station.name, "code": station.code, "lat": station.geom.y, "lon": station.geom.x, 
                 "straight_distance": round(station.geom.distance(user_location) * 111_000, 2)
                }
                for station in stations_near_user
            ],
            "stations_near_destination": [
                {"id": station.id, "name": station.name, "code": station.code, "lat": station.geom.y, "lon": station.geom.x,
                 "straight_distance": round(station.geom.distance(destination_location) * 111_000, 2) 
                }
                for station in stations_near_destination
            ],
        })


class RouteDetailView(APIView):
    def get(self, request, route_code):
        # Hiển thị trạm duy nhất (28, 36)
        related_routes = BusRoute.objects.filter(route_code=route_code).all()
        related_stations = BusStation.objects.filter(
            station_routes__route__route_code=route_code
        ).distinct()
        data = {
            "bus_routes": related_routes,
            "bus_stations": related_stations,
            "users": User.objects.all(),
        }
        serializer = MapSerializer(data)
        return Response(serializer.data)


class RouteCodeListView(APIView):
    def get(self, request):
        codes = BusRoute.objects.values_list("route_code", flat=True).distinct()
        return Response(codes)

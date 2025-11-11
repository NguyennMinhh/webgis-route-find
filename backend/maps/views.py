from django.http import HttpResponse
from rest_framework.response import Response
from django.shortcuts import render
from .models import User, BusRoute, BusStation
from maps.serializers import UserSerializer, MapSerializer, RouteCodeSerializer
from rest_framework import generics
from rest_framework.views import APIView


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
    
    # def post(self, request):
        


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

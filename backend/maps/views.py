from django.http import HttpResponse
from rest_framework.response import Response
from django.shortcuts import render
from .models import User, BusRoute, BusStation
from maps.serializers import UserSerializer, MapSerializer
from rest_framework import generics
from rest_framework.views import APIView

class UserListApiView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class MapView(APIView):
    def get(self, request):
        data = {
            'bus_routes': BusRoute.objects.all(),
            'bus_stations': BusStation.objects.all(),
            'users': User.objects.all()
        }

        # Hiển thị trạm duy nhất (28, 36)
        # route_code = 36
        # related_bus_routes = BusRoute.objects.filter(route_code=route_code).all()
        # related_bus_stations = BusStation.objects.filter(
        #     station_routes__route__route_code=route_code
        # ).distinct()
        # data = {
        #     'bus_routes': related_bus_routes,
        #     'bus_stations': related_bus_stations,
        #     'users': User.objects.all()
        # }


        serializer = MapSerializer(data)
        return Response(serializer.data)
    
# class RouteDetailView(APIView):
#     def get(self, request, route_code):
#         bus_routes =  BusRoute.objects.get(route_code=route_code).all()
#         bus_routes_relations = bus_routes.

    

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
        serializer = MapSerializer(data)
        return Response(serializer.data)
    
# class RouteDetailView(APIView):
#     def get(self, request, route_code):
#         bus_routes =  BusRoute.objects.get(route_code=route_code).all()
#         bus_routes_relations = bus_routes.

    

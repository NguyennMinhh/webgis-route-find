from rest_framework import serializers
from .models import User, BusStation, BusRoute, RouteStation

class BusRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusRoute
        fields = (
            'id',
            'name',
            'route_code',
            'geom',
            'direction'
        )

class BusStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusStation
        fields = (
            'id',
            'name',
            'code',
            'geom'
        )

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields= (
            'id',
            'username',
            'age',
            'geom'
        )

class MapSerializer(serializers.Serializer):
    bus_routes = BusRouteSerializer(many=True, read_only=True)
    bus_stations = BusStationSerializer(many=True, read_only=True)
    users = UserSerializer(many=True)

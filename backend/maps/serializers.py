from rest_framework import serializers
from .models import User, Location, RouteHistory

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields= (
            'id',
            'username',
            'age',
            'latitude',
            'longitude'
        )
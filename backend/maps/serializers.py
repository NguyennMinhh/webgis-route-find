from rest_framework import serializers
from .models import User, BusStation, BusRoute

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields= (
            'id',
            'username',
            'age',
            'geom'
        )
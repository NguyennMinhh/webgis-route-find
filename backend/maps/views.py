from django.http import HttpResponse
from django.shortcuts import render
from .models import User, Location, RouteHistory
from maps.serializers import UserSerializer
from rest_framework import generics

def index(request):
    return HttpResponse()

class UserListApiView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    

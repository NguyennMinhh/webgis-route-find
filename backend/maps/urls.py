from django.urls import path
from . import views

urlpatterns = [
    path('', views.MapView.as_view(), name='MapView'),
    path('user/', views.UserListApiView.as_view(), name='UserListApiView')
]
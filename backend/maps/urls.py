from django.urls import path
from . import views

urlpatterns = [
    path("", views.MapView.as_view(), name="MapView"),
    # bus
    path(
        "route/<int:route_code>/",
        views.RouteDetailView.as_view(),
        name="RouteDetailView",
    ),
    path(
        "route/code_list/", views.RouteCodeListView.as_view(), name="RouteCodeListView"
    ),
    # user
    path("user/", views.UserListApiView.as_view(), name="UserListApiView"),
]

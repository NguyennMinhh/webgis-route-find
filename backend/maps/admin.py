from django.contrib import admin
from .models import User, BusStation, BusRoute, RouteStation

# Register your models here.
admin.site.register(User)
admin.site.register(BusStation)
admin.site.register(BusRoute)
admin.site.register(RouteStation)

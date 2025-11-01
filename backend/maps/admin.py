from django.contrib import admin
from .models import User, BusStation, BusRoute

# Register your models here.
admin.site.register(User)
admin.site.register(BusStation)
admin.site.register(BusRoute)

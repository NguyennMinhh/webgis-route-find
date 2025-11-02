from django.contrib.gis.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser

# Validators:
# def check_legit_latitude(value):
#     if not 90 >= value >= -90:
#         raise ValidationError('Latitude must in range of -90 to 90')
    
# def check_legit_longitude(value):
#     if not 180 >= value >= -180:
#         raise ValidationError('Longitude must in range of -180 to 180')
    
# Models:
class User(AbstractUser):
    age = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(130)],
        null=True,
        blank=True
    )
    geom = models.PointField(srid=4326, null=True, blank=True)
    def __str__(self):
        return self.username


class BusStation(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    code = models.CharField(max_length=20, unique=True)
    geom = models.PointField(srid=4326)
    def __str__(self):
        return self.name or f"Station {self.id}"
    

class BusRoute(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    route_code = models.CharField(max_length=20)
    geom = models.LineStringField(srid=4326, null=True, blank=True)
    start_station = models.ForeignKey(
        BusStation, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='routes_starting'
    )
    end_station = models.ForeignKey(
        BusStation, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='routes_ending'
    )
    direction = models.CharField(
        max_length=10,
        choices=[('go', 'Lượt đi'), ('return', 'Lượt về')]
    )

    def __str__(self):
        return self.name or f"Route {self.id}"


class RouteStation(models.Model):
    route = models.ForeignKey(BusRoute, on_delete=models.CASCADE, related_name='route_stations')
    station = models.ForeignKey(BusStation, on_delete=models.CASCADE, related_name='station_routes')
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']    # Đảm bảo trạm hiện đúng thứ tự
        unique_together = ('route', 'station')  # tránh trùng trạm trong cùng tuyến

    def __str__(self):
        return f"{self.route.route_code} - {self.station.code} ({self.order})"


class PolygonZone(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    geom = models.PolygonField(srid=4326)
    def __str__(self):
        return self.name or f"Zone {self.id}"

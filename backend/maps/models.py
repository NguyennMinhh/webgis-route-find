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
    objectid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    geom = models.PointField(srid=4326)
    def __str__(self):
        return self.name or f"Station {self.objectid}"
    
class BusRoute(models.Model):
    objectid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    geom = models.LineStringField(srid=4326)
    def __str__(self):
        return self.name or f"Route {self.objectid}"


class PolygonZone(models.Model):
    objectid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    geom = models.PolygonField(srid=4326)
    def __str__(self):
        return self.name or f"Zone {self.objectid}"

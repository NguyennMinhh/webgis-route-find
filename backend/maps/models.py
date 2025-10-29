from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser

# Validators:
def check_legit_latitude(value):
    if not 90 >= value >= -90:
        raise ValidationError('Latitude must in range of -90 to 90')
    
def check_legit_longitude(value):
    if not 180 >= value >= -180:
        raise ValidationError('Longitude must in range of -180 to 180')
    
# Models:
class User(AbstractUser):
    age = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(130)],
        null=True,
        blank=True
    )
    latitude = models.FloatField(
        validators=[check_legit_latitude],
        null=True,
        blank=True
    )
    longitude = models.FloatField(
        validators=[check_legit_longitude],
        null=True,
        blank=True
    )

    def __str__(self):
        return self.username

class Location(models.Model):
    class TypeChoices(models.TextChoices):
        RESTAURANT = 'RES', 'Restaurant'
        SCHOOL = 'SCH', 'School'
        SHOP  = 'SHP', 'Shop'
        HOSPITAL = 'HOS', 'Hospital'
        PARK = 'PRK', 'Park'

    name = models.CharField(max_length=100)
    latitude = models.FloatField(
        validators=[check_legit_latitude]
    )
    longitude = models.FloatField(
        validators=[check_legit_longitude]
    )
    location_type = models.CharField(max_length=3, choices=TypeChoices.choices)

    def __str__(self):
        return self.name
    
class RouteHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_route_history')
    # Lưu toạ độ tại thời điểm tra route
    user_origin_latitude = models.FloatField(null=True, blank=True)
    user_origin_longitude = models.FloatField(null=True, blank=True)
    # Thêm origin nếu route giữa 2 địa điểm trong DB
    origin = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name='origin_route_history')
    # Địa điểm cuối cần đến:
    destination = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='destination_route_history')
    distance_km = models.FloatField()
    duration_min = models.FloatField()
    geometry = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.origin:
            return f"{self.user.username}: {self.origin.name} → {self.destination.name}"
        return f"{self.user.username}: ({self.user_origin_latitude}, {self.user_origin_longitude}) → {self.destination.name}"
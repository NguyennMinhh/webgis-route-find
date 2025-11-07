from django.contrib.gis.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser
from django.db.models import Min, Max


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

    def update_start_end(self):
        """Tự động cập nhật trạm đầu và cuối dựa trên RouteStation."""
        route_stations = self.route_stations.all()
        if route_stations.exists():
            first_station = route_stations.order_by('order').first().station
            last_station = route_stations.order_by('-order').first().station
            self.start_station = first_station
            self.end_station = last_station
            self.save(update_fields=['start_station', 'end_station'])

    def __str__(self):
        return self.name or f"Route {self.route_code}"


class RouteStation(models.Model):
    route = models.ForeignKey(BusRoute, on_delete=models.CASCADE, related_name='route_stations')
    station = models.ForeignKey(BusStation, on_delete=models.CASCADE, related_name='station_routes')
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']
        unique_together = ('route', 'station')

    def __str__(self):
        return f"{self.route.route_code} - {self.station.code} ({self.order})"

    def save(self, *args, **kwargs):
        """Sau khi thêm hoặc chỉnh sửa, tự cập nhật start và end station."""
        super().save(*args, **kwargs)
        self.route.update_start_end()

    def delete(self, *args, **kwargs):
        """Sau khi xóa, cũng tự cập nhật lại start và end station."""
        route = self.route
        super().delete(*args, **kwargs)
        route.update_start_end()


class PolygonZone(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    geom = models.PolygonField(srid=4326)

    def __str__(self):
        return self.name or f"Zone {self.id}"

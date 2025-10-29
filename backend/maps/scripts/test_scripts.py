from maps.models import User, Location, RouteHistory
from django.utils import timezone
from django.db import connection

def run():
    user1 = User.objects.create(
        username="Minh",
        age=21,
        latitude=21.03692,
        longitude=105.80192    
    )

    school1 = Location.objects.create(
        name="Trường Tiểu học Quan Hoa",
        latitude=21.03692,
        longitude=105.80192,
        location_type=Location.TypeChoices.SCHOOL
    )
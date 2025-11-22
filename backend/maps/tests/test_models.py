from django.test import TestCase
from django.contrib.gis.geos import Point, LineString
from maps.models import BusStation, BusRoute, RouteStation

class BusStationModel(TestCase):
    def setUp(self):
        self.station = BusStation.objects.create(
            name="Trạm Test",
            code="TEST01",
            geom=Point(105.8342, 21.0278, srid=4326)
        )

    def test_station_creation(self):
        self.assertEqual(self.station.name, "Trạm Test")
        self.assertEqual(self.station.code, "TEST01")
        self.assertIsNotNone(self.station.geom)

    def test_station_str_method(self):
        self.assertEqual(str(self.station), "Trạm Test")
        
    def test_unique_code_constraint(self):
        from django.db import IntegrityError

        with(self.assertRaises(IntegrityError)):
            BusStation.objects.create(
                name="Trạm Test 2",
                code="TEST01", 
                geom=Point(105.8400, 21.0300, srid=4326)
            )

    def test_geom_is_point(self):
        self.assertEqual(self.station.geom.geom_type, 'Point')
        self.assertEqual(self.station.geom.srid, 4326)

class BusRouteModelTest(TestCase):
    def setUp(self):
        self.start_station = BusStation.objects.create(
            name="Trạm Đầu",
            code="START01",
            geom=Point(105.8342, 21.0278, srid=4326)
        )

        self.end_station = BusStation.objects.create(
            name="Trạm Cuối",
            code="END01",
            geom=Point(105.8400, 21.0300, srid=4326)
        )

        self.route = BusRoute.objects.create(
            name="Tuyến Test",
            route_code="28",
            direction="go",
            start_station=self.start_station,
            end_station=self.end_station,
            geom=LineString(
                [(105.8342, 21.0278), (105.8400, 21.0300)],
                srid=4326
            )
        )

    def test_route_direction_choices(self):
        route_return = BusRoute.objects.create(
            name="Tuyến về",
            route_code="28",
            direction="return",
            geom=LineString([(105.8400, 210300), (105.8342, 21.027)], srid=4326)
        )
        self.assertEqual(route_return.direction, "return")

    def test_route_has_start_end_stations(self):
        self.assertEqual(self.route.start_station, self.start_station)
        self.assertEqual(self.route.end_station, self.end_station)

class RouteStationModelTest(TestCase):
    def setUp(self):
        # Tạo các station
        self.station1 = BusStation.objects.create(
            name="Trạm 1", code="S1",
            geom=Point(105.8342, 21.0278, srid=4326)
        )
        self.station2 = BusStation.objects.create(
            name="Trạm 2", code="S2",
            geom=Point(105.8350, 21.0285, srid=4326)
        )
        self.station3 = BusStation.objects.create(
            name="Trạm 3", code="S3",
            geom=Point(105.8400, 21.0300, srid=4326)
        )

        # Tạo các route
        self.route1 = BusRoute.objects.create(
            name="Tuyến 1 đến 2",
            route_code="28",
            direction="go"
        )

        self.route2 = BusRoute.objects.create(
            name="Tuyến 2 đến 3",
            route_code="28",
            direction="go"
        )

        self.route3 = BusRoute.objects.create(
            name="Tuyến 3 đến 1",
            route_code="28",
            direction="go"
        )

    def test_create_route_station(self):
        rs = RouteStation.objects.create(
            route=self.route1,
            station=self.station1,
            order=1
        )
        self.assertEqual(rs.order, 1)
        self.assertEqual(rs.route, self.route1)
        self.assertEqual(rs.station, self.station1)

    def test_route_station_ordering(self):
        routestation1 = RouteStation.objects.create(route=self.route1, station=self.station1, order=1)
        routestation2 = RouteStation.objects.create(route=self.route2, station=self.station2, order=2)
        routestation3 = RouteStation.objects.create(route=self.route3, station=self.station3, order=3)

        self.assertEqual(routestation1.order, 1)
        self.assertEqual(routestation2.order, 2)
        self.assertEqual(routestation3.order, 3)


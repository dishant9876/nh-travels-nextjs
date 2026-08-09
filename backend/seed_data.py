import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "nh_backend.settings")
import django
django.setup()
from datetime import time
from decimal import Decimal
from booking.models import Bus, BusSeat, City, Route, RouteFare, Stop, Trip, TripSeat

bus, _ = Bus.objects.get_or_create(registration_number="NH-DEMO-001", defaults={"name":"NH Travels", "model":"Eicher Skyline", "bus_type":"AC Semi-Sleeper", "total_seats":40, "amenities":["AC","Semi-sleeper","USB","Wi-Fi"]})
for row in range(1,11):
    for col in ["A","B","C","D"]:
        BusSeat.objects.get_or_create(bus=bus, number=f"{row}{col}", defaults={"row":row,"column":col,"seat_type":"SEMI_SLEEPER"})
route, _ = Route.objects.get_or_create(code="NH-GKP-CNB", defaults={"name":"Gorakhpur ↔ Ayodhya ↔ Lucknow ↔ Kanpur"})
# Clear only route-owned configuration so the seed remains deterministic.
route.stops.all().delete()
out = [(City.GORAKHPUR,1,time(7,0),None,False),(City.AYODHYA,2,time(9,30),None,False),(City.LUCKNOW,3,time(12,0),None,False),(City.KANPUR,4,None,time(14,0),False)]
ret = [(City.KANPUR,1,time(16,0),None,False),(City.LUCKNOW,2,time(19,0),None,False),(City.AYODHYA,3,time(21,30),None,False),(City.GORAKHPUR,4,None,time(0,0),True)]
# Same cities occur once in the route; use outbound canonical stops and direction determines interpretation of time.
for city, seq, dep, arr, next_day in out:
    Stop.objects.create(route=route, city=city, sequence=seq, departure_time=dep, arrival_time=arr, next_day=next_day, address=city.title())
# Store return times as a second route so each direction has its own ordered stops.
return_route, _ = Route.objects.get_or_create(code="NH-CNB-GKP", defaults={"name":"Kanpur ↔ Lucknow ↔ Ayodhya ↔ Gorakhpur"})
return_route.stops.all().delete()
for city, seq, dep, arr, next_day in ret:
    Stop.objects.create(route=return_route, city=city, sequence=seq, departure_time=dep, arrival_time=arr, next_day=next_day, address=city.title())
prices = {(City.GORAKHPUR,City.AYODHYA):275,(City.GORAKHPUR,City.LUCKNOW):500,(City.GORAKHPUR,City.KANPUR):725,(City.AYODHYA,City.LUCKNOW):225,(City.AYODHYA,City.KANPUR):500,(City.LUCKNOW,City.KANPUR):275}
for r in [route, return_route]:
    stops = {s.city:s for s in r.stops.all()}
    for (a,b), price in prices.items():
        if a in stops and b in stops and stops[a].sequence < stops[b].sequence:
            RouteFare.objects.update_or_create(route=r, from_stop=stops[a], to_stop=stops[b], defaults={"price":Decimal(price)})
# Create daily trips on demand; existing trips get their correct route based on direction.
for direction, r in [(Trip.Direction.OUTBOUND, route),(Trip.Direction.RETURN, return_route)]:
    # Trip rows are created by search endpoint for the requested date.
    pass
print("Seed complete. Bus:", bus.registration_number, "Routes:", route.code, return_route.code)

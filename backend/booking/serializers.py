from rest_framework import serializers
from .models import Booking, Customer, Route, RouteFare, Stop, Trip, TripSeat

class StopSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source="get_city_display", read_only=True)
    time = serializers.SerializerMethodField()
    class Meta:
        model = Stop
        fields = ["id", "city", "city_name", "sequence", "time", "next_day", "address"]
    def get_time(self, obj):
        value = obj.departure_time or obj.arrival_time
        return value.strftime("%I:%M %p").lstrip("0") if value else None

class TripSerializer(serializers.ModelSerializer):
    bus_name = serializers.CharField(source="bus.name", read_only=True)
    bus_model = serializers.CharField(source="bus.model", read_only=True)
    bus_type = serializers.CharField(source="bus.bus_type", read_only=True)
    amenities = serializers.JSONField(source="bus.amenities", read_only=True)
    stops = serializers.SerializerMethodField()
    class Meta:
        model = Trip
        fields = ["id", "travel_date", "direction", "bus_name", "bus_model", "bus_type", "amenities", "stops"]
    def get_stops(self, obj):
        return StopSerializer(obj.route.stops.all(), many=True).data

class SeatSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    number = serializers.CharField()
    row = serializers.IntegerField()
    column = serializers.CharField()
    seat_type = serializers.CharField()
    status = serializers.ChoiceField(choices=["AVAILABLE", "OCCUPIED", "HELD"])

class BookingPassengerSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField()
    sex = serializers.CharField(max_length=20)
    age = serializers.IntegerField(required=False, allow_null=True, min_value=1, max_value=120)
    alternatePhone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    notes = serializers.CharField(required=False, allow_blank=True)

class BookingCreateSerializer(serializers.Serializer):
    trip_id = serializers.IntegerField()
    hold_token = serializers.UUIDField()
    from_city = serializers.ChoiceField(choices=[c[0] for c in __import__('booking.models', fromlist=['City']).City.choices])
    to_city = serializers.ChoiceField(choices=[c[0] for c in __import__('booking.models', fromlist=['City']).City.choices])
    passenger = BookingPassengerSerializer()
    payment_method = serializers.CharField(required=False, allow_blank=True)

class BookingSerializer(serializers.ModelSerializer):
    passenger = serializers.SerializerMethodField()
    seats = serializers.SerializerMethodField()
    route = serializers.SerializerMethodField()
    date = serializers.DateField(source="trip.travel_date")
    class Meta:
        model = Booking
        fields = ["reference", "status", "date", "route", "seats", "passenger", "total_amount", "payment_method", "created_at", "confirmed_at"]
    def get_passenger(self, obj):
        c = obj.customer
        return {"name": c.name, "phone": c.phone, "email": c.email, "sex": c.sex, "age": c.age, "alternatePhone": c.alternate_phone, "notes": c.notes}
    def get_seats(self, obj):
        return [s.trip_seat.seat.number for s in obj.seats.select_related("trip_seat__seat").all()]
    def get_route(self, obj):
        return {"from": obj.boarding_stop.city, "to": obj.dropping_stop.city, "from_time": StopSerializer(obj.boarding_stop).data["time"], "to_time": StopSerializer(obj.dropping_stop).data["time"]}

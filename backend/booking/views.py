from datetime import datetime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from .models import Bus, City, Booking, Route, RouteFare, SeatHold, Trip, TripSeat
from .serializers import BookingCreateSerializer, BookingSerializer, SeatSerializer, TripSerializer
from .services import create_booking, create_holds, confirm_demo_payment, purge_expired_holds, stop_range

class HealthView(APIView):
    def get(self, request): return Response({"status": "ok", "service": "NH Travels API"})

class SearchTripsView(APIView):
    def get(self, request):
        from_city = request.query_params.get("from")
        to_city = request.query_params.get("to")
        date = request.query_params.get("date")
        if from_city not in City.values or to_city not in City.values or from_city == to_city:
            raise ValidationError("Valid from/to cities are required.")
        try: travel_date = datetime.strptime(date, "%Y-%m-%d").date()
        except (TypeError, ValueError): raise ValidationError("date must be YYYY-MM-DD.")
        order = [City.GORAKHPUR, City.AYODHYA, City.LUCKNOW, City.KANPUR]
        direction = Trip.Direction.OUTBOUND if order.index(from_city) < order.index(to_city) else Trip.Direction.RETURN
        route_code = "NH-GKP-CNB" if direction == Trip.Direction.OUTBOUND else "NH-CNB-GKP"
        route = get_object_or_404(Route, code=route_code, active=True)
        bus = get_object_or_404(Bus, registration_number="NH-DEMO-001", active=True)
        trip, created = Trip.objects.get_or_create(travel_date=travel_date, direction=direction, defaults={"bus": bus, "route": route})
        if created:
            TripSeat.objects.bulk_create([TripSeat(trip=trip, seat=seat) for seat in bus.seats.filter(active=True)], ignore_conflicts=True)
        fare = RouteFare.objects.get(route=route, from_stop__city=from_city, to_stop__city=to_city).price
        return Response({"trip": TripSerializer(trip).data, "fare": str(fare)})

class TripDetailView(APIView):
    def get(self, request, trip_id):
        trip = get_object_or_404(Trip.objects.select_related("bus", "route"), pk=trip_id, active=True)
        return Response(TripSerializer(trip).data)

class TripSeatsView(APIView):
    def get(self, request, trip_id):
        trip = get_object_or_404(Trip.objects.select_related("route"), pk=trip_id, active=True)
        from_city, to_city = request.query_params.get("from"), request.query_params.get("to")
        from_stop, to_stop = stop_range(trip, from_city, to_city)
        purge_expired_holds(trip)
        result = []
        now = timezone.now()
        for ts in trip.trip_seats.select_related("seat").all():
            occupied = ts.booking_seats.filter(booking__status=Booking.Status.CONFIRMED, boarding_sequence__lt=to_stop.sequence, dropping_sequence__gt=from_stop.sequence).exists()
            held = ts.holds.filter(expires_at__gt=now, boarding_sequence__lt=to_stop.sequence, dropping_sequence__gt=from_stop.sequence).exists()
            result.append({"id": ts.id, "number": ts.seat.number, "row": ts.seat.row, "column": ts.seat.column, "seat_type": ts.seat.seat_type, "status": "OCCUPIED" if occupied else "HELD" if held else "AVAILABLE"})
        return Response({"trip_id": trip.id, "from": from_city, "to": to_city, "seats": SeatSerializer(result, many=True).data})

class SeatHoldView(APIView):
    def post(self, request, trip_id):
        trip = get_object_or_404(Trip.objects.select_related("route"), pk=trip_id, active=True)
        seats = request.data.get("seats", [])
        from_city, to_city = request.data.get("from"), request.data.get("to")
        if not seats or not isinstance(seats, list): raise ValidationError("Select at least one seat.")
        holds, expiry = create_holds(trip, seats, from_city, to_city)
        return Response({"hold_token": str(holds[0].token), "expires_at": expiry.isoformat(), "seats": seats}, status=status.HTTP_201_CREATED)

class BookingCreateView(APIView):
    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        trip = get_object_or_404(Trip, pk=data["trip_id"], active=True)
        p = data["passenger"]
        passenger = {"name": p["name"], "phone": p["phone"], "email": p["email"], "sex": p["sex"], "age": p.get("age"), "alternate_phone": p.get("alternatePhone", ""), "notes": p.get("notes", "")}
        booking = create_booking(trip, data["hold_token"], passenger, data["from_city"], data["to_city"], data.get("payment_method", "UPI"))
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

class BookingDetailView(APIView):
    def get(self, request, reference):
        booking = get_object_or_404(Booking.objects.select_related("trip", "customer", "boarding_stop", "dropping_stop"), reference=reference)
        return Response(BookingSerializer(booking).data)

class DemoPaymentView(APIView):
    def post(self, request, reference):
        booking = get_object_or_404(Booking, reference=reference)
        booking = confirm_demo_payment(booking)
        return Response(BookingSerializer(booking).data)

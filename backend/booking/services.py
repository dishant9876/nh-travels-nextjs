from decimal import Decimal
from django.db import transaction
import uuid
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import Booking, BookingSeat, Customer, SeatHold, Trip, TripSeat

HOLD_MINUTES = 10

def stop_range(trip, from_city, to_city):
    stops = list(trip.route.stops.all())
    from_stop = next((s for s in stops if s.city == from_city), None)
    to_stop = next((s for s in stops if s.city == to_city), None)
    if not from_stop or not to_stop or from_stop.sequence >= to_stop.sequence:
        raise ValidationError("Invalid boarding/dropping stops for this trip direction.")
    return from_stop, to_stop

def purge_expired_holds(trip):
    SeatHold.objects.filter(trip=trip, expires_at__lte=timezone.now()).delete()

def seat_is_conflicting(trip_seat, start, end, exclude_hold=None):
    booking_conflict = BookingSeat.objects.filter(
        trip_seat=trip_seat,
        booking__status=Booking.Status.CONFIRMED,
        boarding_sequence__lt=end,
        dropping_sequence__gt=start,
    ).exists()
    hold_qs = SeatHold.objects.filter(
        trip_seat=trip_seat,
        expires_at__gt=timezone.now(),
        boarding_sequence__lt=end,
        dropping_sequence__gt=start,
    )
    if exclude_hold:
        hold_qs = hold_qs.exclude(pk=exclude_hold.pk)
    return booking_conflict or hold_qs.exists()

@transaction.atomic
def create_holds(trip, seat_numbers, from_city, to_city):
    purge_expired_holds(trip)
    from_stop, to_stop = stop_range(trip, from_city, to_city)
    trip_seats = list(TripSeat.objects.select_for_update().select_related("seat").filter(trip=trip, seat__number__in=seat_numbers, seat__active=True))
    if len(trip_seats) != len(set(seat_numbers)):
        raise ValidationError("One or more selected seats do not exist.")
    for ts in trip_seats:
        if seat_is_conflicting(ts, from_stop.sequence, to_stop.sequence):
            raise ValidationError(f"Seat {ts.seat.number} is no longer available for this journey.")
    expiry = SeatHold.expiry()
    token = uuid.uuid4()
    holds = [SeatHold.objects.create(token=token, trip=trip, trip_seat=ts, boarding_sequence=from_stop.sequence, dropping_sequence=to_stop.sequence, expires_at=expiry) for ts in trip_seats]
    return holds, expiry

@transaction.atomic
def create_booking(trip, hold_token, passenger, from_city, to_city, payment_method):
    purge_expired_holds(trip)
    holds = list(SeatHold.objects.select_for_update().select_related("trip_seat__seat").filter(token=hold_token, trip=trip, expires_at__gt=timezone.now()))
    if not holds:
        raise ValidationError("Seat hold expired. Please select your seats again.")
    if any(h.trip_seat.trip_id != trip.id for h in holds):
        raise ValidationError("Invalid seat hold.")
    from_stop, to_stop = stop_range(trip, from_city, to_city)
    if any(h.boarding_sequence != from_stop.sequence or h.dropping_sequence != to_stop.sequence for h in holds):
        raise ValidationError("Seat hold does not match the selected journey.")
    for h in holds:
        if seat_is_conflicting(h.trip_seat, h.boarding_sequence, h.dropping_sequence, exclude_hold=h):
            raise ValidationError(f"Seat {h.trip_seat.seat.number} is no longer available.")
    fare = trip.route.fares.get(from_stop=from_stop, to_stop=to_stop).price
    customer = Customer.objects.create(**passenger)
    booking = Booking.objects.create(trip=trip, customer=customer, boarding_stop=from_stop, dropping_stop=to_stop,
                                     total_amount=Decimal(fare) * len(holds), payment_method=payment_method or "UPI")
    for h in holds:
        BookingSeat.objects.create(booking=booking, trip_seat=h.trip_seat, boarding_sequence=h.boarding_sequence,
                                   dropping_sequence=h.dropping_sequence, price=fare)
    SeatHold.objects.filter(pk__in=[h.pk for h in holds]).delete()
    return booking

@transaction.atomic
def confirm_demo_payment(booking):
    if booking.status != Booking.Status.PAYMENT_PENDING:
        raise ValidationError("Booking is not awaiting payment.")
    from .models import Payment
    payment, _ = Payment.objects.get_or_create(booking=booking, defaults={"amount": booking.total_amount, "gateway": "DEMO"})
    payment.status = Payment.Status.SUCCESS
    payment.paid_at = timezone.now()
    payment.save(update_fields=["status", "paid_at"])
    booking.status = Booking.Status.CONFIRMED
    booking.confirmed_at = timezone.now()
    booking.save(update_fields=["status", "confirmed_at"])
    return booking

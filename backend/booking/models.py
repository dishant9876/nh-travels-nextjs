import uuid
from django.db import models
from django.utils import timezone
from datetime import timedelta

class City(models.TextChoices):
    GORAKHPUR = "GORAKHPUR", "Gorakhpur"
    AYODHYA = "AYODHYA", "Ayodhya"
    LUCKNOW = "LUCKNOW", "Lucknow"
    KANPUR = "KANPUR", "Kanpur"

class Bus(models.Model):
    name = models.CharField(max_length=120, default="NH Travels")
    model = models.CharField(max_length=120, default="Eicher Skyline")
    registration_number = models.CharField(max_length=30, unique=True)
    bus_type = models.CharField(max_length=50, default="AC Semi-Sleeper")
    total_seats = models.PositiveIntegerField(default=40)
    active = models.BooleanField(default=True)
    amenities = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.registration_number}"

class BusSeat(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name="seats")
    number = models.CharField(max_length=10)
    row = models.PositiveIntegerField()
    column = models.CharField(max_length=2)
    seat_type = models.CharField(max_length=50, default="SEMI_SLEEPER")
    active = models.BooleanField(default=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["bus", "number"], name="uniq_bus_seat")]
        ordering = ["row", "column"]

    def __str__(self):
        return f"{self.bus.registration_number} / {self.number}"

class Route(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=30, unique=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Stop(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="stops")
    city = models.CharField(max_length=30, choices=City.choices)
    sequence = models.PositiveIntegerField()
    arrival_time = models.TimeField(null=True, blank=True)
    departure_time = models.TimeField(null=True, blank=True)
    next_day = models.BooleanField(default=False)
    address = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["sequence"]
        constraints = [models.UniqueConstraint(fields=["route", "sequence"], name="uniq_route_sequence"),
                       models.UniqueConstraint(fields=["route", "city"], name="uniq_route_city")]

    def __str__(self):
        return f"{self.route.code} - {self.city}"

class RouteFare(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="fares")
    from_stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name="departure_fares")
    to_stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name="arrival_fares")
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["route", "from_stop", "to_stop"], name="uniq_route_fare")]

    def __str__(self):
        return f"{self.from_stop.city} → {self.to_stop.city}: ₹{self.price}"

class Trip(models.Model):
    class Direction(models.TextChoices):
        OUTBOUND = "OUTBOUND", "Gorakhpur → Kanpur"
        RETURN = "RETURN", "Kanpur → Gorakhpur"
    bus = models.ForeignKey(Bus, on_delete=models.PROTECT, related_name="trips")
    route = models.ForeignKey(Route, on_delete=models.PROTECT, related_name="trips")
    travel_date = models.DateField()
    direction = models.CharField(max_length=20, choices=Direction.choices)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["bus", "travel_date", "direction"], name="uniq_daily_trip")]
        ordering = ["travel_date", "direction"]

    def __str__(self):
        return f"{self.travel_date} - {self.get_direction_display()}"

class TripSeat(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="trip_seats")
    seat = models.ForeignKey(BusSeat, on_delete=models.PROTECT, related_name="trip_seats")

    class Meta:
        constraints = [models.UniqueConstraint(fields=["trip", "seat"], name="uniq_trip_seat")]

    def __str__(self):
        return f"{self.trip} / {self.seat.number}"

class Customer(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    sex = models.CharField(max_length=20)
    age = models.PositiveIntegerField(null=True, blank=True)
    alternate_phone = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.phone})"

class Booking(models.Model):
    class Status(models.TextChoices):
        PAYMENT_PENDING = "PAYMENT_PENDING", "Payment pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        CANCELLED = "CANCELLED", "Cancelled"
        EXPIRED = "EXPIRED", "Expired"
        REFUNDED = "REFUNDED", "Refunded"
    reference = models.CharField(max_length=20, unique=True, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.PROTECT, related_name="bookings")
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="bookings")
    boarding_stop = models.ForeignKey(Stop, on_delete=models.PROTECT, related_name="boarding_bookings")
    dropping_stop = models.ForeignKey(Stop, on_delete=models.PROTECT, related_name="dropping_bookings")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PAYMENT_PENDING)
    payment_method = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = "NH" + uuid.uuid4().hex[:10].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.reference

class BookingSeat(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="seats")
    trip_seat = models.ForeignKey(TripSeat, on_delete=models.PROTECT, related_name="booking_seats")
    boarding_sequence = models.PositiveIntegerField()
    dropping_sequence = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.booking.reference} / {self.trip_seat.seat.number}"

class SeatHold(models.Model):
    token = models.UUIDField(default=uuid.uuid4, db_index=True, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="holds")
    trip_seat = models.ForeignKey(TripSeat, on_delete=models.CASCADE, related_name="holds")
    boarding_sequence = models.PositiveIntegerField()
    dropping_sequence = models.PositiveIntegerField()
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def active(self):
        return self.expires_at > timezone.now()

    @classmethod
    def expiry(cls):
        return timezone.now() + timedelta(minutes=10)

class Payment(models.Model):
    class Status(models.TextChoices):
        CREATED = "CREATED", "Created"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"
        REFUNDED = "REFUNDED", "Refunded"
    booking = models.OneToOneField(Booking, on_delete=models.PROTECT, related_name="payment")
    gateway = models.CharField(max_length=30, default="DEMO")
    gateway_order_id = models.CharField(max_length=100, blank=True)
    gateway_payment_id = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CREATED)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

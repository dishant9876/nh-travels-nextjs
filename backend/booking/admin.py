from django.contrib import admin
from .models import Booking, BookingSeat, Bus, BusSeat, Customer, Payment, Route, RouteFare, SeatHold, Stop, Trip, TripSeat

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ("name", "model", "registration_number", "bus_type", "total_seats", "active")
    list_filter = ("active",)
    search_fields = ("name", "registration_number")

@admin.register(BusSeat)
class BusSeatAdmin(admin.ModelAdmin):
    list_display = ("bus", "number", "row", "column", "seat_type", "active")
    list_filter = ("bus", "active")
    search_fields = ("number",)

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "active")

@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ("route", "sequence", "city", "departure_time", "arrival_time", "next_day")
    list_filter = ("route", "city")

@admin.register(RouteFare)
class RouteFareAdmin(admin.ModelAdmin):
    list_display = ("route", "from_stop", "to_stop", "price")
    list_filter = ("route",)

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("travel_date", "direction", "bus", "route", "active")
    list_filter = ("direction", "travel_date", "active")
    date_hierarchy = "travel_date"

@admin.register(TripSeat)
class TripSeatAdmin(admin.ModelAdmin):
    list_display = ("trip", "seat")
    list_filter = ("trip",)

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "sex", "created_at")
    search_fields = ("name", "phone", "email")

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("reference", "trip", "customer", "boarding_stop", "dropping_stop", "total_amount", "status", "created_at")
    list_filter = ("status", "trip__travel_date")
    search_fields = ("reference", "customer__name", "customer__phone")
    readonly_fields = ("reference", "created_at", "confirmed_at")

@admin.register(BookingSeat)
class BookingSeatAdmin(admin.ModelAdmin):
    list_display = ("booking", "trip_seat", "price", "boarding_sequence", "dropping_sequence")
    list_filter = ("booking__status",)

@admin.register(SeatHold)
class SeatHoldAdmin(admin.ModelAdmin):
    list_display = ("token", "trip", "trip_seat", "expires_at", "created_at")
    list_filter = ("trip",)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("booking", "gateway", "amount", "status", "created_at", "paid_at")
    list_filter = ("status", "gateway")

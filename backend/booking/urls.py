from django.urls import path
from .views import BookingCreateView, BookingDetailView, DemoPaymentView, HealthView, SearchTripsView, SeatHoldView, TripDetailView, TripSeatsView
from .payment_views import RazorpayOrderView, RazorpayWebhookView

urlpatterns = [
    path("health/", HealthView.as_view()),
    path("trips/search/", SearchTripsView.as_view()),
    path("trips/<int:trip_id>/", TripDetailView.as_view()),
    path("trips/<int:trip_id>/seats/", TripSeatsView.as_view()),
    path("trips/<int:trip_id>/holds/", SeatHoldView.as_view()),
    path("bookings/", BookingCreateView.as_view()),
    path("bookings/<str:reference>/", BookingDetailView.as_view()),
    path("bookings/<str:reference>/demo-pay/", DemoPaymentView.as_view()),
    path("bookings/<str:reference>/payment/order/", RazorpayOrderView.as_view()),
    path("payments/razorpay/webhook/", RazorpayWebhookView.as_view()),
]

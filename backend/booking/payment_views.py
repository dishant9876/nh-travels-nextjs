import json
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from .models import Booking
from .payment_gateway import create_order, process_webhook, verify_webhook

class RazorpayOrderView(APIView):
    def post(self, request, reference):
        booking = get_object_or_404(Booking, reference=reference)
        if booking.status != Booking.Status.PAYMENT_PENDING:
            raise ValidationError("Booking is not awaiting payment.")
        order = create_order(booking)
        return Response({"key_id": __import__("django.conf", fromlist=["settings"]).settings.RAZORPAY_KEY_ID, "order_id": order["id"], "amount": order["amount"], "currency": order["currency"], "booking_reference": booking.reference})

class RazorpayWebhookView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request):
        verify_webhook(request.body, request.headers.get("X-Razorpay-Signature"))
        process_webhook(json.loads(request.body.decode("utf-8")))
        return Response({"ok": True})

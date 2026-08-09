import hmac
import hashlib
import json
from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import Booking, Payment


def client():
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise ValidationError("Razorpay credentials are not configured.")
    # Lazy import keeps local demo mode independent of the Razorpay SDK.
    import razorpay
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_order(booking):
    order = client().order.create({
        "amount": int(booking.total_amount * 100),
        "currency": "INR",
        "receipt": booking.reference,
        "notes": {"booking_reference": booking.reference},
    })
    payment, _ = Payment.objects.get_or_create(booking=booking, defaults={"amount": booking.total_amount, "gateway": "RAZORPAY"})
    payment.gateway = "RAZORPAY"
    payment.gateway_order_id = order["id"]
    payment.amount = booking.total_amount
    payment.status = Payment.Status.CREATED
    payment.save()
    return order


def verify_webhook(raw_body, signature):
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        raise ValidationError("Razorpay webhook secret is not configured.")
    expected = hmac.new(settings.RAZORPAY_WEBHOOK_SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature or ""):
        raise ValidationError("Invalid Razorpay webhook signature.")


def process_webhook(payload):
    event = payload.get("event")
    entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    order_id = entity.get("order_id")
    if not order_id:
        return None
    try:
        payment = Payment.objects.select_related("booking").get(gateway_order_id=order_id)
    except Payment.DoesNotExist:
        return None
    if event == "payment.captured":
        payment.status = Payment.Status.SUCCESS
        payment.gateway_payment_id = entity.get("id", "")
        payment.paid_at = timezone.now()
        payment.save(update_fields=["status", "gateway_payment_id", "paid_at"])
        booking = payment.booking
        booking.status = Booking.Status.CONFIRMED
        booking.confirmed_at = timezone.now()
        booking.save(update_fields=["status", "confirmed_at"])
    elif event == "payment.failed":
        payment.status = Payment.Status.FAILED
        payment.gateway_payment_id = entity.get("id", "")
        payment.save(update_fields=["status", "gateway_payment_id"])
    return payment

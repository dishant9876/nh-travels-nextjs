# NH Travels Booking Platform

NH Travels booking platform with a reusable Next.js frontend and Django REST backend.

## Flow

1. Search: From + To + Date
2. Review the single NH Travels bus and timetable
3. Select AC semi-sleeper seats
4. Passenger details: name, phone, email, sex, age, alternate phone, notes
5. Payment
6. Booking confirmation

All seats have the same route fare. Seat selection never changes the fare.

## Project structure

```text
app/                 Next.js page and global styles
components/          Reusable UI components
lib/                 frontend types, API client and journey helpers
public/images/       NH Travels assets
backend/             Django REST API + PostgreSQL models + Admin
```

## Run frontend

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Run backend

Requirements: Python 3.11+ recommended, Docker Desktop for PostgreSQL/Redis.

```bash
cd backend
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env
docker compose up -d
python manage.py migrate
python seed_data.py
python manage.py createsuperuser
python manage.py runserver 8000
```

Admin: http://127.0.0.1:8000/admin/
API health: http://127.0.0.1:8000/api/v1/health/

The frontend proxies `/api/backend/*` to Django on port 8000, so CORS is not required for the normal local flow.

## Payment

The local flow uses the `demo-pay` endpoint so the complete booking flow can be tested without credentials.

For production, configure Razorpay keys in `backend/.env` and call:

`POST /api/v1/bookings/{reference}/payment/order/`

Then let the Razorpay webhook confirm the booking:

`POST /api/v1/payments/razorpay/webhook/`

Do not treat a frontend payment-success callback as authoritative; the signed webhook is the source of truth.

## Seat locking

Seats are locked for 10 minutes when the customer continues from seat selection. The backend uses PostgreSQL transactions and row-level locks and stores segment boundaries on each hold/booking. Therefore a seat booked Gorakhpur → Ayodhya can still be sold Ayodhya → Lucknow, while overlapping journeys are blocked.

## Exact NH Travels data

Outbound:
- Gorakhpur 07:00 AM
- Ayodhya 09:30 AM
- Lucknow 12:00 PM
- Kanpur 02:00 PM

Return:
- Kanpur 04:00 PM
- Lucknow 07:00 PM
- Ayodhya 09:30 PM
- Gorakhpur 12:00 AM next day

Fares:
- Gorakhpur → Ayodhya ₹275
- Gorakhpur → Lucknow ₹500
- Gorakhpur → Kanpur ₹725
- Ayodhya → Lucknow ₹225
- Ayodhya → Kanpur ₹500
- Lucknow → Kanpur ₹275

## Production hardening still required

Before launch, add real Razorpay/PayU credentials, email/SMS/WhatsApp notifications, cancellation/refund policy, rate limiting, monitoring, backups, HTTPS, secrets management, and an authenticated operational/admin deployment.

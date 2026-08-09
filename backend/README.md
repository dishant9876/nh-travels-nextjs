# NH Travels Django REST Backend

A local-first backend for the NH Travels one-bus booking flow.

## Local development — no Docker required

The default local setup uses:
- Django 5.2
- Django REST Framework
- **SQLite** database (`db.sqlite3`)
- Django in-memory cache for local seat holds
- Razorpay only when real payment credentials are configured

This means you do **not** need Docker, PostgreSQL, or Redis on an office laptop just to run and test the application locally.

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python seed_data.py
python manage.py createsuperuser
python manage.py runserver 8000
```

Admin: http://127.0.0.1:8000/admin/
Health: http://127.0.0.1:8000/api/v1/health/

## Production

For production, install the optional production dependencies:

```bash
pip install -r requirements-production.txt
```

Then set `DATABASE_URL` to PostgreSQL and `REDIS_URL` to Redis. This keeps the production architecture scalable while keeping local development zero-infrastructure.

## Booking behavior

Seat availability is segment-aware. A seat booked Gorakhpur → Ayodhya does not block the same seat for Ayodhya → Kanpur. Overlapping segments are blocked. Holds expire after 10 minutes.

All seats are AC semi-sleeper and have the same fare.

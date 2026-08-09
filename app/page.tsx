"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type ApiSeat, type ApiTrip } from "@/lib/api";
import { cityToCode } from "@/lib/backend";
import { cities, getFare } from "@/lib/routes";
import type { Passenger, SearchState, SelectedSeat, Step } from "@/lib/types";
import { formatDate, getSchedule } from "@/lib/journey";
import { Loader } from "@/components/loader";
import { SiteHeader } from "@/components/site-header";
import { ProgressSteps } from "@/components/progress-steps";
import { HomePage } from "@/components/home-page";
import { BusDetails } from "@/components/bus-details";
import { SeatMap } from "@/components/seat-map";
import { PassengerForm } from "@/components/passenger-form";
import { Payment } from "@/components/payment";
import { BookingConfirmation } from "@/components/booking-confirmation";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("search");
  const [search, setSearch] = useState<SearchState>({ from: "Gorakhpur", to: "Kanpur", date: new Date().toISOString().slice(0, 10) });
  const [trip, setTrip] = useState<ApiTrip | null>(null);
  const [baseFare, setBaseFare] = useState(0);
  const [seatInventory, setSeatInventory] = useState<ApiSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [holdToken, setHoldToken] = useState("");
  const [holdExpiry, setHoldExpiry] = useState("");
  const [passenger, setPassenger] = useState<Passenger>({ name: "", phone: "", email: "", sex: "", alternatePhone: "", age: "", notes: "" });
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [showFullSchedule, setShowFullSchedule] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => { const timer = setTimeout(() => setLoading(false), 1300); return () => clearTimeout(timer); }, []);

  const schedule = useMemo(() => getSchedule(search.from, search.to), [search.from, search.to]);
  const total = baseFare * selectedSeats.length;

  const searchBackend = async () => {
    setError(""); setBusy(true);
    try {
      const result = await api.search(cityToCode[search.from], cityToCode[search.to], search.date);
      setTrip(result.trip); setBaseFare(Number(result.fare)); setSelectedSeats([]); setHoldToken(""); setSeatInventory([]); setStep("details");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to search trips."); }
    finally { setBusy(false); }
  };

  const loadSeats = async () => {
    if (!trip) return;
    setError(""); setBusy(true);
    try {
      const result = await api.seats(trip.id, cityToCode[search.from], cityToCode[search.to]);
      setSeatInventory(result.seats); setStep("seats");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load seats."); }
    finally { setBusy(false); }
  };

  const selectSeat = (id: string) => {
    if (seatInventory.find(s => s.number === id)?.status !== "AVAILABLE") return;
    setSelectedSeats(current => current.some(s => s.id === id) ? current.filter(s => s.id !== id) : [...current, { id }]);
  };

  const holdSeatsAndContinue = async () => {
    if (!trip || !selectedSeats.length) return;
    setError(""); setBusy(true);
    try {
      const result = await api.hold(trip.id, cityToCode[search.from], cityToCode[search.to], selectedSeats.map(s => s.id));
      setHoldToken(result.hold_token); setHoldExpiry(result.expires_at); setStep("passenger");
    } catch (e) { setError(e instanceof Error ? e.message : "One of the selected seats is no longer available."); await loadSeats(); }
    finally { setBusy(false); }
  };

  const pay = async () => {
    if (!trip || !holdToken) return;
    setError(""); setBusy(true);
    try {
      const created = await api.createBooking({ trip_id: trip.id, hold_token: holdToken, from_city: cityToCode[search.from], to_city: cityToCode[search.to], payment_method: paymentMethod, passenger: { ...passenger, age: passenger.age ? Number(passenger.age) : null } });
      const confirmed = await api.demoPay(created.reference);
      setBooking(confirmed); setStep("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Payment/booking failed. Please try again."); }
    finally { setBusy(false); }
  };

  const reset = () => {
    setStep("search"); setSelectedSeats([]); setSeatInventory([]); setHoldToken(""); setHoldExpiry(""); setTrip(null); setBaseFare(0); setBooking(null);
    setPassenger({ name: "", phone: "", email: "", sex: "", alternatePhone: "", age: "", notes: "" }); setPaymentMethod("UPI"); setError("");
  };

  if (loading) return <Loader />;
  return <main>
    <SiteHeader onHome={reset} />
    <ProgressSteps step={step} />
    {error && <div className="api-error" role="alert">{error}</div>}
    {busy && <div className="api-busy">Processing…</div>}
    {step === "search" && <HomePage search={search} setSearch={setSearch} onSearch={searchBackend} />}
    {step === "details" && <BusDetails search={search} baseFare={baseFare || getFare(search.from, search.to)} schedule={schedule} onBack={() => setStep("search")} onContinue={loadSeats} showFullSchedule={showFullSchedule} setShowFullSchedule={setShowFullSchedule} />}
    {step === "seats" && <SeatMap selectedSeats={selectedSeats} baseFare={baseFare} total={total} from={search.from} to={search.to} dateLabel={formatDate(search.date)} departure={schedule.fromTime} inventory={seatInventory} onSelect={selectSeat} onBack={() => setStep("details")} onContinue={holdSeatsAndContinue} />}
    {step === "passenger" && <PassengerForm passenger={passenger} setPassenger={setPassenger} selectedSeats={selectedSeats} from={search.from} to={search.to} dateLabel={formatDate(search.date)} total={total} onBack={() => setStep("seats")} onContinue={() => setStep("payment")} />}
    {step === "payment" && <Payment search={search} schedule={schedule} passenger={passenger} selectedSeats={selectedSeats} baseFare={baseFare} total={total} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} dateLabel={formatDate(search.date)} holdExpiry={holdExpiry} onBack={() => setStep("passenger")} onEditPassenger={() => setStep("passenger")} onPay={pay} />}
    {step === "done" && booking && <BookingConfirmation bookingId={booking.reference} search={search} schedule={schedule} passenger={passenger} selectedSeats={selectedSeats} total={Number(booking.total_amount)} dateLabel={formatDate(search.date)} onReset={reset} />}
    <SiteFooter />
  </main>;
}

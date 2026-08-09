import { Check } from "lucide-react";
import type { Passenger, SearchState, SelectedSeat } from "@/lib/types";

export function BookingConfirmation({ bookingId, search, schedule, passenger, selectedSeats, total, dateLabel, onReset }: {
  bookingId:string; search:SearchState; schedule:{fromTime:string;toTime:string}; passenger:Passenger; selectedSeats:SelectedSeat[]; total:number; dateLabel:string; onReset:()=>void;
}) {
  return <section className="success"><div className="success-card"><div className="check"><Check size={34}/></div><div className="eyebrow orange">BOOKING CONFIRMED</div><h1>Your journey is booked.</h1><p>Thank you for choosing NH Travels — <b>Driven by trust.</b></p>
    <div className="ticket"><div><span>Booking ID</span><b>{bookingId}</b></div><div><span>Route</span><b>{search.from} → {search.to}</b></div><div><span>Departure</span><b>{dateLabel} · {schedule.fromTime}</b></div><div><span>Seats</span><b>{selectedSeats.map(s=>s.id).join(", ")}</b></div><div><span>Passenger</span><b>{passenger.name}</b></div><div><span>Total paid</span><b>₹{total}</b></div></div>
    <button className="primary" onClick={onReset}>Book another trip</button>
  </div></section>;
}

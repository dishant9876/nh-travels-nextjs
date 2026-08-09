"use client";
import { ArrowLeft, ArrowRight, CreditCard, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import type { Passenger, SelectedSeat } from "@/lib/types";

export function Payment({ search, schedule, passenger, selectedSeats, baseFare, total, paymentMethod, setPaymentMethod, dateLabel, holdExpiry, onBack, onEditPassenger, onPay }: any) {
  return <section className="page">
    <div className="page-heading"><button className="back" onClick={onBack}><ArrowLeft size={15}/> Back to passenger details</button><h1>Payment</h1><p>Review the final amount and complete your booking.</p></div>
    <div className="checkout-grid">
      <div className="checkout-main">
        <div className="checkout-card"><div className="card-head"><h2>Journey review</h2><button onClick={onBack}>Change</button></div>
          <div className="journey-review"><div><b>{schedule.fromTime}</b><span>{search.from}</span></div><ArrowRight/><div><b>{schedule.toTime}</b><span>{search.to}</span></div></div>
          <div className="review-meta"><span>📅 {dateLabel}</span><span>🚌 NH Travels</span><span>💺 {selectedSeats.map((s:SelectedSeat)=>s.id).join(", ")}</span></div>
        </div>
        <div className="checkout-card"><div className="card-head"><h2>Passenger</h2><button onClick={onEditPassenger}>Edit</button></div>
          <div className="passenger-summary"><div><UserRound size={17}/><span><b>{passenger.name}</b><small>{passenger.sex}{passenger.age?` · ${passenger.age} years`:""}</small></span></div><div><Phone size={17}/><span>{passenger.phone}</span></div><div><Mail size={17}/><span>{passenger.email}</span></div></div>
        </div>
        <div className="checkout-card"><div className="card-head"><h2>Choose payment method</h2></div>
          <div className="payments">{["UPI","Card","Net Banking"].map(method=><button className={paymentMethod===method?"payment active":"payment"} key={method} onClick={()=>setPaymentMethod(method)}>{method}</button>)}</div>
          <div className="payment-placeholder"><CreditCard size={20}/><span>Secure payment will be connected to Razorpay / PayU in production.</span></div>
        </div>
      </div>
      <aside className="summary-card sticky"><h2>Fare summary</h2><div className="line"><span>₹{baseFare} × {selectedSeats.length} seat{selectedSeats.length>1?"s":""}</span><b>₹{total}</b></div><div className="line"><span>Seat selection fee</span><b>₹0</b></div><div className="line"><span>Taxes / other fees</span><b>₹0</b></div><div className="total"><span>Payable</span><b>₹{total}</b></div><button className="primary full" onClick={onPay}>Pay ₹{total} <ArrowRight size={17}/></button><div className="secure"><ShieldCheck size={17}/> Secure checkout</div>{holdExpiry && <p className="tiny">Seats are reserved until {new Date(holdExpiry).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.</p>}</aside>
    </div>
  </section>;
}

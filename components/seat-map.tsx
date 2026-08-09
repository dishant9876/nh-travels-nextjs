"use client";
import { ArrowRight, DoorOpen, CircleGauge } from "lucide-react";
import type { ApiSeat } from "@/lib/api";
import type { SelectedSeat } from "@/lib/types";

const seatRows = Array.from({ length: 10 }, (_, row) => ({
  row: row + 1,
  left: [`${row + 1}A`, `${row + 1}B`],
  right: [`${row + 1}C`, `${row + 1}D`],
}));

export function SeatMap({ selectedSeats, baseFare, total, from, to, dateLabel, departure, inventory, onSelect, onBack, onContinue }: {
  selectedSeats: SelectedSeat[]; baseFare: number; total: number; from: string; to: string;
  dateLabel: string; departure: string; inventory: ApiSeat[]; onSelect: (id: string) => void; onBack: () => void; onContinue: () => void;
}) {
  return (
    <section className="page">
      <div className="page-heading">
        <button className="back" onClick={onBack}>← Back to bus details</button>
        <h1>Select your seats</h1><p>{from} → {to} · {dateLabel}</p>
      </div>
      <div className="seat-layout">
        <div className="bus-shell realistic-bus">
          <div className="bus-front">
            <div className="driver-area"><CircleGauge size={21} /><div><b>Driver</b><small>Front cabin</small></div></div>
            <div className="front-door"><DoorOpen size={20} /><span>Entry door</span></div>
          </div>
          <div className="bus-aisle-label"><span>FRONT</span><i /><span>REAR</span></div>
          <div className="seat-note"><b>AC Semi-Sleeper</b><span>All seats have the same fare · Select any available seat</span></div>
          <div className="legend">
            <span><i className="seat available-demo" /> Available</span>
            <span><i className="seat selected-demo" /> Selected</span>
            <span><i className="seat unavailable-demo" /> Occupied</span>
          </div>
          <div className="coach-window left-window" aria-hidden="true" />
          <div className="coach-window right-window" aria-hidden="true" />
          <div className="realistic-seats">
            {seatRows.map((row) => (
              <div className="seat-row" key={row.row}>
                <div className="seat-pair">{row.left.map((id) => <BusSeat key={id} id={id} selected={selectedSeats.some(s=>s.id===id)} status={inventory.find(s=>s.number===id)?.status ?? "AVAILABLE"} onSelect={onSelect} />)}</div>
                <div className="aisle"><span>{row.row}</span></div>
                <div className="seat-pair">{row.right.map((id) => <BusSeat key={id} id={id} selected={selectedSeats.some(s=>s.id===id)} status={inventory.find(s=>s.number===id)?.status ?? "AVAILABLE"} onSelect={onSelect} />)}</div>
              </div>
            ))}
          </div>
          <div className="rear-section"><span>REAR</span><div className="rear-bar" /></div>
        </div>
        <SeatSummary selectedSeats={selectedSeats} baseFare={baseFare} total={total} from={from} to={to} dateLabel={dateLabel} departure={departure} onContinue={onContinue} />
      </div>
    </section>
  );
}

function BusSeat({ id, selected, status, onSelect }: { id:string; selected:boolean; status:"AVAILABLE"|"OCCUPIED"|"HELD"; onSelect:(id:string)=>void }) {
  const unavailable = status !== "AVAILABLE";
  return <button type="button" disabled={unavailable} onClick={()=>onSelect(id)}
    className={`seat semi-sleeper realistic-seat ${selected ? "selected":""} ${unavailable ? "unavailable":""}`}
    title={`${id} · AC semi-sleeper`} aria-label={`Seat ${id}${status === "OCCUPIED" ? ", occupied" : status === "HELD" ? ", temporarily held" : selected ? ", selected" : ", available"}`}>
    <span className="seat-number">{id}</span><span className="seat-recline" />
  </button>;
}

function SeatSummary({ selectedSeats, baseFare, total, from, to, dateLabel, departure, onContinue }: {
  selectedSeats: SelectedSeat[]; baseFare:number; total:number; from:string; to:string; dateLabel:string; departure:string; onContinue:()=>void;
}) {
  return <aside className="summary-card sticky">
    <h2>Your trip</h2><div className="summary-route"><b>{from}</b><span>→</span><b>{to}</b></div><p>{dateLabel} · {departure}</p><hr/>
    <h3>Selected seats</h3>
    {selectedSeats.length===0 ? <p className="muted">Select one or more semi-sleeper seats.</p> : selectedSeats.map(seat=><div className="line" key={seat.id}><span>Seat {seat.id}<small>AC semi-sleeper</small></span><b>₹{baseFare}</b></div>)}
    <div className="line"><span>Fare × {selectedSeats.length}</span><b>₹{total}</b></div>
    <div className="total"><span>Total</span><b>₹{total}</b></div>
    <button className="primary full" disabled={!selectedSeats.length} onClick={onContinue}>Continue <ArrowRight size={17}/></button>
    <p className="tiny">No additional charge for selecting a particular seat.</p>
  </aside>;
}

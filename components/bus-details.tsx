"use client";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ChevronDown, Clock3, MapPin, Wifi } from "lucide-react";
import { getJourneyStops } from "@/lib/journey";
import { outboundStops, returnStops } from "@/lib/routes";
import type { City, SearchState } from "@/lib/types";

type Props = {
  search: SearchState; baseFare: number;
  schedule: { fromTime: string; toTime: string; duration: string };
  onBack: () => void; onContinue: () => void;
  showFullSchedule: boolean; setShowFullSchedule: (value: boolean) => void;
};

export function BusDetails({ search, baseFare, schedule, onBack, onContinue, showFullSchedule, setShowFullSchedule }: Props) {
  const outbound = ["Gorakhpur", "Ayodhya", "Lucknow", "Kanpur"].indexOf(search.from) < ["Gorakhpur", "Ayodhya", "Lucknow", "Kanpur"].indexOf(search.to);
  const primaryRoute = outbound ? outboundStops : returnStops;
  const returnRoute = outbound ? returnStops : outboundStops;

  return (
    <section className="page">
      <div className="page-heading">
        <button className="back" onClick={onBack}><ArrowLeft size={15} /> Change search</button>
        <h1>Review your bus</h1>
        <p>{search.from} → {search.to} · {new Intl.DateTimeFormat("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"}).format(new Date(search.date+"T00:00:00"))}</p>
      </div>
      <div className="result-grid">
        <div className="bus-card featured">
          <div className="bus-main">
            <div className="bus-thumb"><Image src="/images/nh-travels-bus.jpg" alt="NH Travels bus" fill sizes="280px" /></div>
            <div className="bus-info">
              <div className="bus-title"><h2>NH Travels</h2><span className="pill">AC</span></div>
              <p>Eicher Skyline · Semi-sleeper coach · One daily bus</p>
              <div className="amenities"><span>❄ AC</span><span>💺 Semi-sleeper</span><span>🔌 USB</span><span><Wifi size={15} /> Wi-Fi</span></div>
            </div>
            <div className="price"><small>Fare per passenger</small><strong>₹{baseFare.toLocaleString("en-IN")}</strong><span>No seat-based surcharge</span></div>
          </div>
          <div className="journey-banner">
            <div><span>DEPARTS</span><b>{schedule.fromTime}</b><small>{search.from}</small></div>
            <div className="journey-line"><span>{schedule.duration}</span><i /></div>
            <div><span>ARRIVES</span><b>{schedule.toTime}</b><small>{search.to}</small></div>
          </div>
          <button className="stops-toggle" onClick={() => setShowFullSchedule(!showFullSchedule)}>
            {showFullSchedule ? "Hide" : "View"} complete bus schedule <ChevronDown className={showFullSchedule ? "rotate" : ""} size={17} />
          </button>
          {showFullSchedule && (
            <div className="full-schedule">
              <ScheduleGroup title={outbound ? "Gorakhpur → Kanpur" : "Kanpur → Gorakhpur"} label="Daily" stops={primaryRoute} selected={search} />
              <ScheduleGroup title={outbound ? "Kanpur → Gorakhpur" : "Gorakhpur → Kanpur"} label="Return journey" stops={returnRoute} selected={undefined} />
            </div>
          )}
          <div className="card-bottom">
            <span><Clock3 size={16} /> Fixed daily timetable</span>
            <button className="primary" onClick={onContinue}>Continue to seats <ArrowRight size={17} /></button>
          </div>
        </div>
        <aside className="filter-card">
          <h3>Your journey</h3>
          <div className="filter-route"><MapPin size={18} /><span>{search.from}<br /><b>↓</b><br />{search.to}</span></div>
          <div className="fare-box"><span>Fare / passenger</span><b>₹{baseFare}</b></div>
          <div className="fare-box"><span>Seat type</span><b>Semi-sleeper</b></div>
          <p className="tiny">All semi-sleeper seats are priced the same. Your seat choice will not change the fare.</p>
        </aside>
      </div>
    </section>
  );
}

function ScheduleGroup({ title, label, stops, selected }: { title: string; label: string; stops: {city: City; time: string; address: string}[]; selected?: SearchState }) {
  return (
    <>
      <div className="schedule-direction"><b>{title}</b><span>{label}</span></div>
      {stops.map((stop) => (
        <div className={`schedule-stop ${selected && (stop.city === selected.from || stop.city === selected.to) ? "selected-stop" : ""}`} key={`${title}-${stop.city}-${stop.time}`}>
          <span className="dot" />
          <div><b>{stop.city}</b><small>{stop.address}</small></div>
          <time>{stop.time}</time>
        </div>
      ))}
    </>
  );
}

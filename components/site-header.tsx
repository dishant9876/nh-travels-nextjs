"use client";
import Image from "next/image";
import { Menu } from "lucide-react";

type Props = { onHome: () => void };

export function SiteHeader({ onHome }: Props) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <button className="brand" onClick={onHome} aria-label="NH Travels home">
          <Image src="/images/nh-travels-logo.jpg" alt="NH Travels" width={180} height={120} />
        </button>
        <nav>
          <button onClick={onHome}>Book a trip</button>
          <button onClick={() => alert("Manage booking will be connected to the booking backend.")}>Manage booking</button>
          <button onClick={() => alert("NH Travels support")}>Help</button>
        </nav>
        <button className="icon-btn" aria-label="Menu"><Menu size={20} /></button>
      </div>
    </header>
  );
}

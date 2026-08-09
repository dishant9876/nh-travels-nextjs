import { ShieldCheck, Wifi, Zap } from "lucide-react";
import { cities } from "@/lib/routes";
import type { SearchState } from "@/lib/types";
import { SearchBox } from "./search-box";

export function HomePage({ search, setSearch, onSearch }: {
  search: SearchState;
  setSearch: React.Dispatch<React.SetStateAction<SearchState>>;
  onSearch: () => void;
}) {
  return (
    <>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="eyebrow">NH TRAVELS • SEMI-SLEEPER AC</div>
          <h1>Travel farther.<br /><em>Travel with trust.</em></h1>
          <p>Gorakhpur · Ayodhya · Lucknow · Kanpur</p>
          <SearchBox search={search} setSearch={setSearch} onSearch={onSearch} />
        </div>
      </section>

      <section className="trust-row">
        <Trust icon={<ShieldCheck />} title="Driven by trust" text="Reliable daily intercity service" />
        <Trust icon={<Zap />} title="One bus, simple journey" text="Fixed schedule every day" />
        <Trust icon={<Wifi />} title="Comfort on board" text="AC semi-sleeper seats" />
      </section>

      <section className="route-section">
        <div>
          <div className="eyebrow orange">OUR DAILY ROUTE</div>
          <h2>One bus. Four cities.</h2>
          <p className="muted">The same NH Travels bus runs Gorakhpur → Kanpur and returns Kanpur → Gorakhpur every day.</p>
        </div>
        <div className="route-line">
          {cities.map((city, i) => (
            <div key={city} className="route-city">
              <span>{i + 1}</span><b>{city}</b>{i < cities.length - 1 && <i />}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Trust({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="trust"><div>{icon}</div><span><b>{title}</b><small>{text}</small></span></div>;
}

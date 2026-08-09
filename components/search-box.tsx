import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { cities } from "@/lib/routes";
import type { City, SearchState } from "@/lib/types";

type Props = {
  search: SearchState;
  setSearch: React.Dispatch<React.SetStateAction<SearchState>>;
  onSearch: () => void;
};

export function SearchBox({ search, setSearch, onSearch }: Props) {
  const valid = search.from !== search.to && Boolean(search.date);
  const swap = () => setSearch((s) => ({ ...s, from: s.to, to: s.from }));

  return (
    <div className="search-box">
      <label><MapPin size={20} /><span>From
        <select value={search.from} onChange={(e) => setSearch({ ...search, from: e.target.value as City })}>
          {cities.map((city) => <option key={city}>{city}</option>)}
        </select>
      </span></label>
      <button className="swap" onClick={swap} aria-label="Swap cities">↔</button>
      <label><MapPin size={20} /><span>To
        <select value={search.to} onChange={(e) => setSearch({ ...search, to: e.target.value as City })}>
          {cities.filter((city) => city !== search.from).map((city) => <option key={city}>{city}</option>)}
        </select>
      </span></label>
      <label><CalendarDays size={20} /><span>Date
        <input type="date" min={new Date().toISOString().slice(0, 10)} value={search.date}
          onChange={(e) => setSearch({ ...search, date: e.target.value })} />
      </span></label>
      <button className="primary search-btn" disabled={!valid} onClick={onSearch}>Search trip <ArrowRight size={18} /></button>
    </div>
  );
}

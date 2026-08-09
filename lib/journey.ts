import { cities, outboundStops, returnStops } from "@/lib/routes";
import type { City } from "@/lib/types";
import type { Stop } from "@/lib/routes";

export function getScheduleForDirection(from: City, to: City): Stop[] {
  return cities.indexOf(from) < cities.indexOf(to) ? outboundStops : returnStops;
}

export function getJourneyStops(from: City, to: City): Stop[] {
  const route = getScheduleForDirection(from, to);
  const start = route.findIndex((stop) => stop.city === from);
  const end = route.findIndex((stop) => stop.city === to);
  if (start < 0 || end < 0) return route;
  return route.slice(Math.min(start, end), Math.max(start, end) + 1);
}

function toMinutes(time: string) {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return hours * 60 + Number(match[2]);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getSchedule(from: City, to: City) {
  const route = getScheduleForDirection(from, to);
  const fromStop = route.find((stop) => stop.city === from)!;
  const toStop = route.find((stop) => stop.city === to)!;
  let duration = toMinutes(toStop.time) - toMinutes(fromStop.time);
  if (duration <= 0) duration += 24 * 60;
  return { fromTime: fromStop.time, toTime: toStop.time, duration: formatDuration(duration) };
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(value + "T00:00:00"));
}

export function isPassengerValid(passenger: { name: string; phone: string; email: string; sex: string }) {
  return passenger.name.trim().length >= 2
    && /^[0-9+\- ]{10,15}$/.test(passenger.phone.trim())
    && passenger.email.includes("@")
    && passenger.sex.trim().length > 0;
}

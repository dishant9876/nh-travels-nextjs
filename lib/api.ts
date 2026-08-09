export type ApiSeat = {
  id: number;
  number: string;
  row: number;
  column: string;
  seat_type: string;
  status: "AVAILABLE" | "OCCUPIED" | "HELD";
};

export type ApiStop = {
  id: number;
  city: string;
  city_name: string;
  sequence: number;
  time: string | null;
  next_day: boolean;
  address: string;
};

export type ApiTrip = {
  id: number;
  travel_date: string;
  direction: "OUTBOUND" | "RETURN";
  bus_name: string;
  bus_model: string;
  bus_type: string;
  amenities: string[];
  stops: ApiStop[];
};

export type SearchResponse = { trip: ApiTrip; fare: string };
export type SeatsResponse = { trip_id: number; from: string; to: string; seats: ApiSeat[] };
export type HoldResponse = { hold_token: string; expires_at: string; seats: string[] };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/backend";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(data?.detail) ? data.detail.join(", ") : data?.detail || data?.non_field_errors?.[0] || "Something went wrong.";
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data as T;
}

export const api = {
  search: (from: string, to: string, date: string) =>
    request<SearchResponse>(`/trips/search/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`),
  seats: (tripId: number, from: string, to: string) =>
    request<SeatsResponse>(`/trips/${tripId}/seats/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  hold: (tripId: number, from: string, to: string, seats: string[]) =>
    request<HoldResponse>(`/trips/${tripId}/holds/`, { method: "POST", body: JSON.stringify({ from, to, seats }) }),
  createBooking: (payload: unknown) =>
    request<any>(`/bookings/`, { method: "POST", body: JSON.stringify(payload) }),
  demoPay: (reference: string) =>
    request<any>(`/bookings/${reference}/demo-pay/`, { method: "POST", body: JSON.stringify({}) }),
};

import type { City } from "@/lib/types";

export type Stop = {
  city: City;
  time: string;
  address: string;
};

export const cities: City[] = ["Gorakhpur", "Ayodhya", "Lucknow", "Kanpur"];

export const fareMatrix: Record<City, Partial<Record<City, number>>> = {
  Gorakhpur: { Ayodhya: 275, Lucknow: 500, Kanpur: 725 },
  Ayodhya: { Gorakhpur: 275, Lucknow: 225, Kanpur: 500 },
  Lucknow: { Gorakhpur: 500, Ayodhya: 225, Kanpur: 275 },
  Kanpur: { Gorakhpur: 725, Ayodhya: 500, Lucknow: 275 },
};

// NH Travels has one bus operating in a fixed daily loop.
export const outboundStops: Stop[] = [
  { city: "Gorakhpur", time: "7:00 AM", address: "Gorakhpur" },
  { city: "Ayodhya", time: "9:30 AM", address: "Ayodhya" },
  { city: "Lucknow", time: "12:00 PM", address: "Lucknow" },
  { city: "Kanpur", time: "2:00 PM", address: "Kanpur" },
];

export const returnStops: Stop[] = [
  { city: "Kanpur", time: "4:00 PM", address: "Kanpur" },
  { city: "Lucknow", time: "7:00 PM", address: "Lucknow" },
  { city: "Ayodhya", time: "9:30 PM", address: "Ayodhya" },
  { city: "Gorakhpur", time: "12:00 AM", address: "Gorakhpur • next day" },
];

export const getFare = (from: City, to: City) => fareMatrix[from]?.[to] ?? 0;

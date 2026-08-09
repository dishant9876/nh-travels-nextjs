export type Step = "search" | "details" | "seats" | "passenger" | "payment" | "done";
export type SearchState = { from: City; to: City; date: string };
export type SelectedSeat = { id: string, label: string };
export type Passenger = {
  name: string;
  phone: string;
  email: string;
  sex: string;
  alternatePhone: string;
  age: string;
  notes: string;
};
export type City = "Gorakhpur" | "Ayodhya" | "Lucknow" | "Kanpur";

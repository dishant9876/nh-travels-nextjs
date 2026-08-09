import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NH Travels — Driven by Trust",
  description: "Online bus booking for Gorakhpur, Ayodhya, Lucknow and Kanpur."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "32 Princess Renovation — Project Dashboard",
  description:
    "Live renovation dashboard — budget tracking, job list, and progress for the 32 Princess Street, Orangeville project.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

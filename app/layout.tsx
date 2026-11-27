
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRP | Trusted Rental Property",
  description:
    "Find verified rental properties with transparent move-in costs and a safer rental process.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import "./globals.css"; // 🔑 The missing link that activates Tailwind globally!
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartERP Core Engine",
  description: "Enterprise multi-tenant ledger management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-950">
      <body className="h-full antialiased text-white">{children}</body>
    </html>
  );
}

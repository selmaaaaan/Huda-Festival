import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Huda Festival 2026 — USTAVERSE | SHIA Arts Fest",
  description:
    "The official home of Huda Festival / SHIA Arts Fest 2026 — 3 days of stage, non-stage and sports competitions across 5 categories and 4 competing teams. Explore programmes, schedule, live scoreboard, results and gallery.",
  keywords: [
    "Huda Festival",
    "SHIA Arts Fest",
    "USTAVERSE",
    "school festival",
    "arts fest 2026",
    "stage competition",
    "leaderboard",
  ],
  authors: [{ name: "Huda Festival Committee" }],
  icons: {
    icon: "/images/logo.png",
  },
  openGraph: {
    title: "Huda Festival 2026 — USTAVERSE",
    description:
      "3 days • 333 programmes • 4 teams • 290 champions. Moyilarity meets modernity.",
    siteName: "Huda Festival",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

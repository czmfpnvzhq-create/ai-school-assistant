import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "@/components/landing/landing.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduNexus — AI-Powered School Management",
  description:
    "Agentic AI school management for admins, teachers, students, and parents. Real data, multi-role access, PKR fees.",
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`landing-page font-dm-sans ${syne.variable} ${dmSans.variable} min-h-screen antialiased`}
    >
      {children}
    </div>
  );
}

import Link from "next/link";
import { ScrollReveal } from "./ScrollReveal";

export function CtaSection() {
  return (
    <section className="relative z-10 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="landing-shimmer-border relative overflow-hidden rounded-3xl landing-glass-strong p-10 text-center sm:p-14">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10"
              aria-hidden
            />
            <div className="relative">
              <h2 className="font-syne text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                Ready to see AI that actually knows your students?
              </h2>
              <p className="mx-auto mt-4 max-w-lg font-dm-sans text-slate-400">
                Try the live demo with pre-seeded Pakistani school data — Ahmed Raza, Class 6,
                PKR fees, and real attendance records.
              </p>
              <Link
                href="/login"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-landing-accent px-8 py-4 font-dm-sans text-sm font-semibold text-white shadow-xl shadow-blue-500/30 transition hover:bg-blue-400"
              >
                Try the Live Demo
                <span aria-hidden>→</span>
              </Link>
              <p className="mt-4 font-dm-sans text-xs text-slate-500">
                Demo accounts provided. No signup needed.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

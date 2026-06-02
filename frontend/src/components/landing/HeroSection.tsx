import Link from "next/link";
import { MockChatCard } from "./MockChatCard";
import { ScrollReveal } from "./ScrollReveal";

export function HeroSection() {
  return (
    <section
      id="demo"
      className="relative z-10 overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28 lg:pt-36"
    >
      <div className="pointer-events-none absolute right-0 top-20 h-[500px] w-[500px] rounded-full bg-blue-500/25 blur-[140px] animate-orb-drift" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <ScrollReveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 font-dm-sans text-xs font-medium text-blue-300">
              <span className="text-blue-400">✦</span>
              Agentic AI · Not a ChatGPT Wrapper
            </div>
          </ScrollReveal>

          <ScrollReveal delayClass="landing-reveal-delay-1">
            <h1 className="font-syne text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
              The School That Thinks.
              <br />
              <span className="landing-text-gradient">AI-Powered Management.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delayClass="landing-reveal-delay-2">
            <p className="mt-6 max-w-xl font-dm-sans text-base leading-relaxed text-slate-400 sm:text-lg">
              EduNexus connects admins, teachers, students and parents — with an AI
              assistant that queries real data, reasons in steps, and answers in seconds.
            </p>
          </ScrollReveal>

          <ScrollReveal delayClass="landing-reveal-delay-3">
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-landing-accent px-6 py-3.5 font-dm-sans text-sm font-semibold text-white shadow-xl shadow-blue-500/30 transition hover:bg-blue-400 hover:shadow-blue-500/40"
              >
                Explore Demo
                <span aria-hidden>→</span>
              </Link>
              <a
                href="https://github.com/czmfpnvzhq-create/ai-school-assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-slate-700/80 px-6 py-3.5 font-dm-sans text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-900/50 hover:text-white"
              >
                View on GitHub
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delayClass="landing-reveal-delay-4">
            <p className="mt-6 font-dm-sans text-xs text-slate-500 sm:text-sm">
              4 roles · 40+ students · Live AI queries
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delayClass="landing-reveal-delay-2" className="flex justify-center lg:justify-end">
          <MockChatCard />
        </ScrollReveal>
      </div>
    </section>
  );
}

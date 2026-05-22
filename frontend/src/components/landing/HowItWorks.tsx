import { ScrollReveal } from "./ScrollReveal";

const STEPS = [
  {
    number: "01",
    icon: "💬",
    title: "Ask in Natural Language",
    description: "A teacher or admin types a question in plain English or Urdu.",
  },
  {
    number: "02",
    icon: "⚙️",
    title: "AI Calls Real Tools",
    description: "The agentic loop runs Prisma queries against your live database.",
  },
  {
    number: "03",
    icon: "✓",
    title: "Get Grounded Answers",
    description: "Responses cite real students, attendance, and fees — never invented data.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative z-10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-dm-sans text-sm font-medium uppercase tracking-widest text-blue-400">
              How it works
            </p>
            <h2 className="mt-3 font-syne text-3xl font-bold text-white sm:text-4xl">
              From question to real data in seconds
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-16">
          <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
            <div
              className="pointer-events-none absolute top-12 hidden h-0.5 w-[calc(100%-8rem)] border-t border-dashed border-slate-700 md:left-16 md:block lg:left-20"
              aria-hidden
            />

            {STEPS.map((step, i) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 font-syne text-lg font-bold text-blue-400 shadow-lg shadow-blue-500/10">
                  {step.number}
                </div>
                <span className="mt-4 text-2xl" role="img" aria-hidden>
                  {step.icon}
                </span>
                <h3 className="mt-3 font-syne text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 max-w-xs font-dm-sans text-sm text-slate-400">
                  {step.description}
                </p>
                {i < STEPS.length - 1 && (
                  <div
                    className="mt-6 h-8 w-px border-l border-dashed border-slate-700 md:hidden"
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

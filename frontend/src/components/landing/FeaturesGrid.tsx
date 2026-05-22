import { ScrollReveal } from "./ScrollReveal";

const FEATURES = [
  {
    icon: "🤖",
    title: "Agentic AI",
    description:
      "Calls real database tools. Reasons in multiple steps. No hallucinated student data.",
  },
  {
    icon: "👥",
    title: "4 Role System",
    description:
      "Admin, Teacher, Student, Parent — each sees exactly what they need.",
  },
  {
    icon: "📊",
    title: "Live Analytics",
    description:
      "Attendance rates, grade averages, fee collection — all real-time.",
  },
  {
    icon: "🔒",
    title: "JWT Security",
    description:
      "Role-based route protection. Per-role AI tool permissions.",
  },
  {
    icon: "📄",
    title: "PDF Reports",
    description: "AI generates downloadable fee reports on demand.",
  },
  {
    icon: "⚡",
    title: "Streaming AI",
    description:
      "Responses stream token by token. No waiting for full completion.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="relative z-10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-dm-sans text-sm font-medium uppercase tracking-widest text-blue-400">
              Features
            </p>
            <h2 className="mt-3 font-syne text-3xl font-bold text-white sm:text-4xl">
              Everything a modern school needs
            </h2>
            <p className="mt-4 font-dm-sans text-slate-400">
              From grounded AI queries to PKR fee tracking — built for Pakistani private schools.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <ScrollReveal
              key={feature.title}
              delayClass={`landing-reveal-delay-${(i % 3) + 1}`}
            >
              <article className="group h-full rounded-2xl landing-glass p-6 transition hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
                <span className="text-2xl" role="img" aria-hidden>
                  {feature.icon}
                </span>
                <h3 className="mt-4 font-syne text-lg font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 font-dm-sans text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

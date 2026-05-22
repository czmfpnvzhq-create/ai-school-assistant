import Link from "next/link";
import { ScrollReveal } from "./ScrollReveal";

const ROLES = [
  {
    icon: "🛡️",
    title: "Admin",
    description: "Full control, AI assistant, fee reports, and school-wide analytics.",
    loginLabel: "Admin",
  },
  {
    icon: "👨‍🏫",
    title: "Teacher",
    description: "Class management, attendance, grades, and AI for your classes.",
    loginLabel: "Teacher",
  },
  {
    icon: "🎓",
    title: "Student",
    description: "View your own grades, attendance records, and school notices.",
    loginLabel: "Student",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Parent",
    description: "Track your child's progress, fees in PKR, and attendance.",
    loginLabel: "Parent",
  },
];

export function RolesSection() {
  return (
    <section id="roles" className="relative z-10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-dm-sans text-sm font-medium uppercase tracking-widest text-blue-400">
              Roles
            </p>
            <h2 className="mt-3 font-syne text-3xl font-bold text-white sm:text-4xl">
              One System. Four Perspectives.
            </h2>
            <p className="mt-4 font-dm-sans text-slate-400">
              Every role gets a tailored dashboard — and AI tools scoped to what they&apos;re allowed to see.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((role, i) => (
            <ScrollReveal
              key={role.title}
              delayClass={`landing-reveal-delay-${(i % 4) + 1}`}
            >
              <article className="flex h-full flex-col rounded-2xl landing-glass p-6 transition hover:border-blue-500/25">
                <span className="text-3xl" role="img" aria-hidden>
                  {role.icon}
                </span>
                <h3 className="mt-4 font-syne text-xl font-bold text-white">{role.title}</h3>
                <p className="mt-2 flex-1 font-dm-sans text-sm leading-relaxed text-slate-400">
                  {role.description}
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center gap-1 font-dm-sans text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  Login as {role.loginLabel}
                  <span aria-hidden>→</span>
                </Link>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { ScrollReveal } from "./ScrollReveal";

const TECH_STACK = [
  { name: "Next.js", icon: NextIcon },
  { name: "NestJS", icon: NestIcon },
  { name: "PostgreSQL", icon: PostgresIcon },
  { name: "Prisma", icon: PrismaIcon },
  { name: "Hugging Face", icon: HuggingFaceIcon },
  { name: "JWT", icon: JwtIcon },
  { name: "Tailwind", icon: TailwindIcon },
];

export function SocialProofBar() {
  return (
    <section className="relative z-10 border-y border-slate-800/60 bg-slate-950/40 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="mb-6 text-center font-dm-sans text-xs font-medium uppercase tracking-widest text-slate-500">
            Built with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-900/50 px-3 py-2 font-dm-sans text-xs text-slate-400 transition hover:border-slate-700 hover:text-slate-300"
              >
                <tech.icon className="h-4 w-4 shrink-0 text-slate-500" />
                {tech.name}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function NextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.5 2h1v16.7l6.3-6.3 1 1-7.8 7.8-7.8-7.8 1-1 6.3 6.3V2z" />
    </svg>
  );
}

function NestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8 2 5 5 5 9c0 4 3 7 7 7v4l3-3-3-3v3c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4h2c0-5-4-9-9-9z" />
    </svg>
  );
}

function PostgresIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <ellipse cx="12" cy="12" rx="8" ry="5" />
      <ellipse cx="12" cy="10" rx="8" ry="5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function PrismaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2L4 20h4l4-10 4 10h4L12 2z" />
    </svg>
  );
}

function HuggingFaceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="10" r="1.5" />
      <circle cx="15" cy="10" r="1.5" />
      <path d="M12 3c-4 0-7 3-7 7 0 3 2 5 4 6v2h6v-2c2-1 4-3 4-6 0-4-3-7-7-7z" />
    </svg>
  );
}

function JwtIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <path d="M8 12h8" />
    </svg>
  );
}

function TailwindIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 6c-3.3 0-5.4 1.7-6.3 5.1 1.1-1.5 2.4-2.1 3.9-1.7 0.8 0.2 1.4 0.8 2 1.5 1.1 1.2 2.3 2.4 4.4 2.4 3.3 0 5.4-1.7 6.3-5.1-1.1 1.5-2.4 2.1-3.9 1.7-0.8-0.2-1.4-0.8-2-1.5C15.3 7.2 14.1 6 12 6zm-6 6c-3.3 0-5.4 1.7-6.3 5.1 1.1-1.5 2.4-2.1 3.9-1.7 0.8 0.2 1.4 0.8 2 1.5 1.1 1.2 2.3 2.4 4.4 2.4 3.3 0 5.4-1.7 6.3-5.1-1.1 1.5-2.4 2.1-3.9 1.7-0.8-0.2-1.4-0.8-2-1.5C9.3 13.2 8.1 12 6 12z" />
    </svg>
  );
}

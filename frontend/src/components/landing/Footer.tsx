import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-800/60 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <Link
            href="/"
            className="flex items-center gap-2 font-syne text-lg font-bold text-white"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/20 text-blue-400">
              ✦
            </span>
            EduNexus
          </Link>
          <p className="mt-2 max-w-xs font-dm-sans text-sm text-slate-500">
            Built to demonstrate agentic AI in education.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-dm-sans text-sm">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition hover:text-white"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition hover:text-white"
          >
            LinkedIn
          </a>
        </div>

        <p className="font-dm-sans text-sm text-slate-600">© 2025 EduNexus</p>
      </div>
    </footer>
  );
}

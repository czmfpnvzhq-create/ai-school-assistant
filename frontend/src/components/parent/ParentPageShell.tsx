"use client";

import React from "react";
import Link from "next/link";

interface ParentPageShellProps {
  title: string;
  subtitle: string;
  icon: string;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  noChild?: boolean;
  childName?: string;
  children: React.ReactNode;
}

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pb-8">
      <div className="h-10 w-72 bg-slate-800 rounded-lg" />
      <div className="h-4 w-96 bg-slate-800 rounded" />
      <div className="h-40 bg-slate-900/50 rounded-2xl" />
      <div className="h-64 bg-slate-900/50 rounded-2xl" />
    </div>
  );
}

export function ParentPageShell({
  title,
  subtitle,
  icon,
  isLoading,
  error,
  onRetry,
  noChild,
  childName,
  children,
}: ParentPageShellProps) {
  if (isLoading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-rose-400 mb-2">Something went wrong</h2>
        <p className="text-slate-400 text-sm max-w-md">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors text-sm font-bold"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (noChild) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
        <div className="text-6xl mb-6">👨‍👩‍👧‍👦</div>
        <h2 className="text-2xl font-bold text-white mb-2">No Child Linked</h2>
        <p className="text-slate-400 text-sm max-w-md bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-xl mt-4">
          Your account is not linked to any student record. Contact the school admin to
          register your email as the parent contact on your child&apos;s profile.
        </p>
        <Link
          href="/dashboard/parent"
          className="mt-6 text-sm text-blue-400 hover:text-blue-300 font-bold"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{icon}</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>
          </div>
          <p className="text-slate-400 text-sm">
            {subtitle}
            {childName && (
              <span className="text-slate-300 font-semibold"> · {childName}</span>
            )}
          </p>
        </div>
        <Link
          href="/dashboard/parent"
          className="text-sm text-slate-400 hover:text-blue-400 transition-colors font-medium shrink-0"
        >
          ← Dashboard
        </Link>
      </div>
      {children}
    </div>
  );
}

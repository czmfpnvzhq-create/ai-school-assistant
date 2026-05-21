"use client";

import React from "react";
import { ParentPageShell } from "@/components/parent/ParentPageShell";
import { useParentData } from "@/lib/useParentData";
import { formatCurrency, formatDate } from "@/lib/parent/utils";

export default function ParentFeesPage() {
  const { child, isLoading, error, refetch } = useParentData();

  const fees = child?.fees ?? [];
  const summary = child?.feeSummary ?? { total: 0, paid: 0, pending: 0 };
  const paidCount = fees.filter((f) => f.paid).length;
  const pendingCount = fees.filter((f) => !f.paid).length;

  return (
    <ParentPageShell
      title="Fee Status"
      subtitle="Tuition fees, payment history, and outstanding balance"
      icon="💰"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      noChild={!isLoading && !error && !child}
      childName={child?.name}
    >
      {child && (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Total Fees" amount={summary.total} variant="default" />
            <SummaryCard label="Amount Paid" amount={summary.paid} variant="paid" />
            <SummaryCard label="Outstanding" amount={summary.pending} variant="pending" />
            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-5 shadow-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Records</p>
              <p className="text-2xl font-extrabold text-white">
                {paidCount} paid · {pendingCount} due
              </p>
            </div>
          </div>

          {/* Fee structure info */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-purple-500/10 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>📋</span> School Fee Structure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-950/50 rounded-xl border border-white/5 p-4">
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Monthly Tuition</p>
                <p className="text-lg font-extrabold text-slate-200">{formatCurrency(5000)}</p>
              </div>
              <div className="bg-slate-950/50 rounded-xl border border-white/5 p-4">
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Billing Cycle</p>
                <p className="text-lg font-extrabold text-slate-200">Per Term</p>
              </div>
              <div className="bg-slate-950/50 rounded-xl border border-white/5 p-4">
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Payment Methods</p>
                <p className="text-slate-300">Bank transfer · School office</p>
              </div>
            </div>
          </div>

          {/* Fee records */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Payment History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
                  <tr>
                    <th className="px-6 py-4">Invoice</th>
                    <th className="px-6 py-4 text-center">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Due / Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {fees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No fee records found for your child.
                      </td>
                    </tr>
                  ) : (
                    fees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-200">Fee #{fee.id}</td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-300">
                          {formatCurrency(fee.amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                              fee.paid
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {fee.paid ? "✓ Paid" : "⚠ Unpaid"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400">
                          {fee.paid && fee.paidAt
                            ? `Paid ${formatDate(fee.paidAt)}`
                            : `Due ${formatDate(fee.dueDate)}`}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {summary.pending > 0 && (
            <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-bold text-amber-300 text-sm">Outstanding balance</p>
                <p className="text-amber-200/80 text-sm mt-1">
                  {formatCurrency(summary.pending)} is pending. Please pay at the school office or via
                  bank transfer before the due date to avoid late fees.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </ParentPageShell>
  );
}

function SummaryCard({
  label,
  amount,
  variant,
}: {
  label: string;
  amount: number;
  variant: "default" | "paid" | "pending";
}) {
  const border =
    variant === "paid"
      ? "border-emerald-500/20"
      : variant === "pending"
      ? "border-rose-500/20"
      : "border-white/5";
  const text =
    variant === "paid"
      ? "text-emerald-400"
      : variant === "pending"
      ? "text-rose-400"
      : "text-white";

  return (
    <div className={`bg-slate-900/50 backdrop-blur-md rounded-2xl border ${border} p-5 shadow-xl`}>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${text}`}>{formatCurrency(amount)}</p>
    </div>
  );
}

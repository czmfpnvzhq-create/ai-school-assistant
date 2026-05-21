"use client";

import React from "react";
import {
  downloadFeeReportPdf,
  type FeeReportData,
} from "@/lib/reports/fee-report-pdf";

interface FeeReportCardProps {
  data: FeeReportData;
  userName?: string;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function CollectionRing({ percent }: { percent: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="relative w-[88px] h-[88px] shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-slate-800"
        />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="url(#feeGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="feeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white leading-none">{percent}%</span>
        <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
          collected
        </span>
      </div>
    </div>
  );
}

export function FeeReportCard({ data, userName }: FeeReportCardProps) {
  const totalAmount = data.collectedAmount + data.pendingAmount;
  const collectedShare =
    totalAmount > 0 ? Math.round((data.collectedAmount / totalAmount) * 100) : 0;

  return (
    <div className="w-full rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 overflow-hidden shadow-xl">
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-base">
          💰
        </span>
        <div>
          <h4 className="text-sm font-bold text-white">Fee collection report</h4>
          <p className="text-[11px] text-slate-500">Live data from school records</p>
        </div>
      </div>

      <div className="p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
        <CollectionRing percent={data.collectionRatePercent} />

        <div className="flex-1 w-full grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-800/50 border border-white/5 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
              Total billed
            </p>
            <p className="text-base font-bold text-white">{formatMoney(totalAmount)}</p>
          </div>
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/20 p-3">
            <p className="text-[10px] text-emerald-500/80 uppercase tracking-wide mb-1">
              Collected
            </p>
            <p className="text-base font-bold text-emerald-300">
              {formatMoney(data.collectedAmount)}
            </p>
          </div>
          <div className="rounded-xl bg-amber-950/30 border border-amber-500/20 p-3">
            <p className="text-[10px] text-amber-500/80 uppercase tracking-wide mb-1">
              Pending
            </p>
            <p className="text-base font-bold text-amber-200">
              {formatMoney(data.pendingAmount)}
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 border border-white/5 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
              Unpaid records
            </p>
            <p className="text-base font-bold text-slate-200">
              {data.pendingRecords}{" "}
              <span className="text-slate-500 font-normal text-sm">
                of {data.totalFees}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="h-1.5 mx-5 mb-4 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
          style={{ width: `${collectedShare}%` }}
        />
      </div>

      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={() =>
            downloadFeeReportPdf(data, {
              generatedBy: userName,
              generatedAt: new Date(),
            })
          }
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2.5 transition-colors shadow-lg shadow-emerald-900/30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download PDF report
        </button>
      </div>
    </div>
  );
}

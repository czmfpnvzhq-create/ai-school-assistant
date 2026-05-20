"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface ClassData {
  id: number;
  name: string;
  teacher: string;
}

interface StudentData {
  id: number;
  name: string;
  class: ClassData;
}

interface Fee {
  id: number;
  studentId: number;
  student: StudentData;
  amount: number;
  paid: boolean;
  dueDate: string;
  paidAt: string | null;
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-800 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-800 rounded-full" /></td>
          <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
          <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-800 rounded-full" /></td>
          <td className="px-6 py-4"><div className="ml-auto h-8 w-28 bg-slate-800 rounded-lg" /></td>
        </tr>
      ))}
    </>
  );
}

interface SummaryStats {
  total: number;
  collected: number;
  pending: number;
  rate: number;
}

export default function FeeManagement() {
  const router = useRouter();

  // List states
  const [fees, setFees] = useState<Fee[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);

  // Summary Metrics state
  const [summary, setSummary] = useState<SummaryStats>({
    total: 0,
    collected: 0,
    pending: 0,
    rate: 0,
  });

  // Filter states
  const [classFilter, setClassFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Fetch fees and summary metrics
  const fetchFees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const queryParams = new URLSearchParams();
      if (classFilter !== "All") {
        queryParams.append("classId", classFilter);
      }
      if (statusFilter !== "All") {
        const isPaid = statusFilter === "Paid" ? "true" : "false";
        queryParams.append("paid", isPaid);
      }

      const res = await fetch(`${API_BASE_URL}/fees?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("edunexus_token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load fee records.");
      }

      const data = await res.json();
      setFees(data.fees);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || "Failed to fetch fee dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [classFilter, statusFilter, router]);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/students/classes/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error("Failed to load classes list", err);
    }
  }, []);

  useEffect(() => {
    fetchFees();
    fetchClasses();
  }, [fetchFees, fetchClasses]);

  // Handle Mark as Paid
  const handleMarkAsPaid = async (id: number) => {
    setError(null);
    setProcessingId(id);
    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/fees/${id}/pay`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to record fee payment.");
      }

      // Re-fetch to update the listing and stats
      await fetchFees();
    } catch (err: any) {
      setError(err.message || "Something went wrong recording payment.");
    } finally {
      setProcessingId(null);
    }
  };

  // Currency Formatter Helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
    }).format(val);
  };

  // Date Formatter Helper
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Fee Management</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor collections, analyze pending fees, and record invoice payments.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-blue-500/20 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-2xl text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
            💳
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Billed</span>
            <h2 className="text-2xl font-extrabold text-white mt-1.5">{formatCurrency(summary.total)}</h2>
          </div>
          <span className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Billed invoices in filter
          </span>
        </div>

        {/* Total Collected */}
        <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-emerald-500/20 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-2xl text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
            💰
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Collected</span>
            <h2 className="text-2xl font-extrabold text-emerald-400 mt-1.5">{formatCurrency(summary.collected)}</h2>
          </div>
          <span className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Paid tuition fees
          </span>
        </div>

        {/* Total Pending */}
        <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-rose-500/20 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-2xl text-rose-500/10 group-hover:text-rose-500/20 transition-colors">
            ⚠️
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending</span>
            <h2 className="text-2xl font-extrabold text-rose-400 mt-1.5">{formatCurrency(summary.pending)}</h2>
          </div>
          <span className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> Outstanding invoices
          </span>
        </div>

        {/* Collection Rate */}
        <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-purple-500/20 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-2xl text-purple-500/10 group-hover:text-purple-500/20 transition-colors">
            📈
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Collection Rate</span>
            <h2 className="text-2xl font-extrabold text-purple-400 mt-1.5">{summary.rate}%</h2>
          </div>
          <span className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> Target collection rate
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/30 backdrop-blur-md rounded-2xl border border-white/5 p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Class Filter */}
          <div className="w-full sm:w-48">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Class filter
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/30 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none cursor-pointer"
            >
              <option value="All">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Payment Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/30 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid Only</option>
              <option value="Unpaid">Unpaid Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 px-5 py-4 rounded-xl text-sm shadow-lg flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            ✕
          </button>
        </div>
      )}

      {/* Fees Grid/Table */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
              <tr>
                <th className="px-6 py-4 rounded-l-lg">Student Name</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs md:text-sm">
              {isLoading ? (
                <SkeletonRows />
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    No fee invoices match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-white/[0.01] transition-colors animate-fade-in">
                    <td className="px-6 py-4 font-bold text-slate-200">{fee.student.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        🏫 {fee.student.class.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-200">{formatCurrency(fee.amount)}</td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(fee.dueDate)}</td>
                    <td className="px-6 py-4">
                      {fee.paid ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
                            ✓ Paid
                          </span>
                          {fee.paidAt && (
                            <span className="text-[10px] text-slate-500 mt-0.5">
                              {formatDate(fee.paidAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 w-fit">
                          ⏳ Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!fee.paid ? (
                        <button
                          onClick={() => handleMarkAsPaid(fee.id)}
                          disabled={processingId === fee.id}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          {processingId === fee.id ? "Processing..." : "💳 Mark as Paid"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">No Actions</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

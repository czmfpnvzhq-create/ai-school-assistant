"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ClassData {
  id: number;
  name: string;
  teacher: string;
}

interface ReportRow {
  studentId: number;
  studentName: string;
  className: string;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

type SortField = "studentName" | "className" | "present" | "absent" | "late" | "percentage";
type SortOrder = "asc" | "desc";

export default function AttendanceReportPage() {
  const router = useRouter();

  // Date range defaults: 30 days ago to today
  const getThirtyDaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  };

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  // State
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [classFilter, setClassFilter] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>(getThirtyDaysAgo());
  const [toDate, setToDate] = useState<string>(getToday());

  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<SortField>("percentage");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Fetch classes
  useEffect(() => {
    async function fetchClasses() {
      setIsLoadingClasses(true);
      try {
        const token = localStorage.getItem("edunexus_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/students/classes/all`, {
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
          throw new Error("Failed to load classes");
        }

        const data = await res.json();
        setClasses(data);
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to fetch classes.");
      } finally {
        setIsLoadingClasses(false);
      }
    }

    fetchClasses();
  }, [router]);

  // Fetch report
  const fetchReport = useCallback(async () => {
    if (!fromDate || !toDate) return;

    setIsLoadingReport(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const queryParams = new URLSearchParams({
        from: fromDate,
        to: toDate,
      });

      if (classFilter !== "All") {
        queryParams.append("classId", classFilter);
      }

      const res = await fetch(`${API_BASE_URL}/attendance/report?${queryParams.toString()}`, {
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
        throw new Error("Failed to load attendance report");
      }

      const data = await res.json();
      setReportData(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load report.");
    } finally {
      setIsLoadingReport(false);
    }
  }, [fromDate, toDate, classFilter, router]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Handle Sort Click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Sorted report data
  const getSortedData = () => {
    const sorted = [...reportData];
    sorted.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Numbers
      return sortOrder === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
    return sorted;
  };

  // Client side CSV export
  const exportToCSV = () => {
    if (reportData.length === 0) return;

    const headers = ["Student Name", "Class", "Present", "Absent", "Late", "Attendance Rate"];
    const rows = reportData.map((row) => [
      row.studentName,
      row.className,
      row.present,
      row.absent,
      row.late,
      `${row.percentage}%`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Attendance_Report_${fromDate}_to_${toDate}_Class_${classFilter}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client side PDF Export
  const exportToPDF = () => {
    if (reportData.length === 0) return;

    const doc = new jsPDF();

    // Find class info if filtered
    const selectedClass = classes.find((c) => c.id.toString() === classFilter);
    const className = selectedClass ? selectedClass.name : "All Classes";
    const teacherName = selectedClass ? selectedClass.teacher : "N/A";

    // 1. Title Block (Header)
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("EDUNEXUS SCHOOL ASSISTANT", 15, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Academic Attendance Report System", 15, 32);

    // 2. Document Meta Block
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ATTENDANCE SUMMARY REPORT", 15, 55);

    // Metadata lines
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(15, 59, 195, 59);

    // Meta details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Class:", 15, 68);
    doc.setFont("helvetica", "normal");
    doc.text(className, 30, 68);

    doc.setFont("helvetica", "bold");
    doc.text("Teacher:", 15, 74);
    doc.setFont("helvetica", "normal");
    doc.text(teacherName, 32, 74);

    doc.setFont("helvetica", "bold");
    doc.text("Date Range:", 115, 68);
    doc.setFont("helvetica", "normal");
    doc.text(`${fromDate} to ${toDate}`, 140, 68);

    doc.setFont("helvetica", "bold");
    doc.text("Reported At:", 115, 74);
    doc.setFont("helvetica", "normal");
    const now = new Date().toLocaleString();
    doc.text(now, 140, 74);

    doc.line(15, 79, 195, 79);

    // 3. Simple Summary metrics
    const totalStudents = reportData.length;
    const avgRate = (
      reportData.reduce((acc, curr) => acc + curr.percentage, 0) / totalStudents
    ).toFixed(1);

    doc.setFillColor(248, 250, 252); // slate-50 background for card
    doc.rect(15, 85, 85, 18, "F");
    doc.rect(110, 85, 85, 18, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("TOTAL STUDENTS RECORDED", 20, 91);
    doc.text("AVERAGE CLASS ATTENDANCE RATE", 115, 91);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(totalStudents.toString(), 20, 99);

    let rateColor = [16, 185, 129]; // green
    const avgNum = parseFloat(avgRate);
    if (avgNum < 75) {
      rateColor = [239, 68, 68]; // red
    } else if (avgNum < 85) {
      rateColor = [245, 158, 11]; // amber
    }
    doc.setTextColor(rateColor[0], rateColor[1], rateColor[2]);
    doc.text(`${avgRate}%`, 115, 99);

    // 4. Data Table
    const headers = [["Student Name", "Class", "Present", "Absent", "Late", "Attendance Rate"]];
    const rows = getSortedData().map((row) => [
      row.studentName,
      row.className,
      row.present,
      row.absent,
      row.late,
      `${row.percentage}%`,
    ]);

    autoTable(doc, {
      startY: 110,
      head: headers,
      body: rows,
      theme: "striped",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "left",
      },
      columnStyles: {
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "right", fontStyle: "bold" },
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      didParseCell: (data) => {
        // Style attendance rates individually
        if (data.column.index === 5 && data.cell.section === "body") {
          const rateVal = parseFloat(data.cell.text[0]);
          if (rateVal < 75) {
            data.cell.styles.textColor = [239, 68, 68];
          } else if (rateVal < 85) {
            data.cell.styles.textColor = [245, 158, 11];
          } else {
            data.cell.styles.textColor = [16, 185, 129];
          }
        }
      },
    });

    // 5. Footer (Simple Page numbering & Signature)
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${i} of ${pageCount} | Generated automatically by EduNexus School Management`,
        15,
        285
      );
    }

    doc.save(`Attendance_Report_${className.replace(/\s+/g, "_")}_${fromDate}_to_${toDate}.pdf`);
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Attendance Reports</h1>
          <p className="text-slate-400 text-sm mt-1">
            Aggregate student attendance across customizable dates and classes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/admin/attendance")}
            className="bg-slate-900/50 hover:bg-slate-800/50 text-slate-200 font-semibold py-2.5 px-5 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
          >
            ← Back to Manager
          </button>
          <button
            onClick={exportToCSV}
            disabled={reportData.length === 0}
            className="bg-slate-900/50 hover:bg-slate-800/50 disabled:opacity-50 text-slate-300 font-semibold py-2.5 px-5 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed"
          >
            📊 Export to CSV
          </button>
          <button
            onClick={exportToPDF}
            disabled={reportData.length === 0}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed"
          >
            📕 Export to PDF
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-5 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Class Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
            Class Filter
          </label>
          {isLoadingClasses ? (
            <div className="h-11 w-full bg-slate-950/20 border border-white/5 animate-pulse rounded-xl" />
          ) : (
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full h-11 bg-slate-950/50 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 text-sm text-slate-200 outline-none transition-all cursor-pointer"
            >
              <option value="All">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* From Date */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full h-11 bg-slate-950/50 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 text-sm text-slate-200 outline-none transition-all"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full h-11 bg-slate-950/50 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 text-sm text-slate-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 px-5 py-4 rounded-xl text-sm shadow-lg">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Report Table */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 select-none">
              <tr>
                <th
                  onClick={() => handleSort("studentName")}
                  className="px-6 py-4 cursor-pointer hover:text-slate-300 transition-colors rounded-l-lg"
                >
                  Student Name {sortField === "studentName" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("className")}
                  className="px-6 py-4 cursor-pointer hover:text-slate-300 transition-colors"
                >
                  Class {sortField === "className" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("present")}
                  className="px-6 py-4 text-center cursor-pointer hover:text-slate-300 transition-colors"
                >
                  Total Present {sortField === "present" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("absent")}
                  className="px-6 py-4 text-center cursor-pointer hover:text-slate-300 transition-colors"
                >
                  Total Absent {sortField === "absent" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("late")}
                  className="px-6 py-4 text-center cursor-pointer hover:text-slate-300 transition-colors"
                >
                  Total Late {sortField === "late" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("percentage")}
                  className="px-6 py-4 text-right cursor-pointer hover:text-slate-300 transition-colors rounded-r-lg"
                >
                  Rate % {sortField === "percentage" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoadingReport ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 mt-2">Generating attendance report...</p>
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    No attendance records found for the selected filter.
                  </td>
                </tr>
              ) : (
                getSortedData().map((row) => {
                  let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  if (row.percentage < 75) {
                    badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                  } else if (row.percentage < 85) {
                    badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  }

                  return (
                    <tr key={row.studentId} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {row.studentName}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{row.className}</td>
                      <td className="px-6 py-4 text-center font-medium text-emerald-400">
                        {row.present}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-rose-400">
                        {row.absent}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-amber-400">
                        {row.late}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold border ${badgeColor}`}>
                          {row.percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

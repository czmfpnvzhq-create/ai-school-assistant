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
  rank: number;
  studentId: number;
  studentName: string;
  className: string;
  subject: string;
  score: number;
  gradeLetter: string;
  examDate: string;
}

const SUBJECT_OPTIONS = ["All", "Math", "Science", "English", "Urdu", "Islamiat"];

export default function GradesReportPage() {
  const router = useRouter();

  // Filters state
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [classFilter, setClassFilter] = useState<string>("All");
  const [subjectFilter, setSubjectFilter] = useState<string>("All");

  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Fetch report data
  const fetchReport = useCallback(async () => {
    setIsLoadingReport(true);
    setErrorMessage(null);
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
      if (subjectFilter !== "All") {
        queryParams.append("subject", subjectFilter);
      }

      const res = await fetch(`${API_BASE_URL}/grades/report?${queryParams.toString()}`, {
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
        throw new Error("Failed to load report data");
      }

      const data = await res.json();
      setReportData(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to fetch report data.");
    } finally {
      setIsLoadingReport(false);
    }
  }, [classFilter, subjectFilter, router]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Calculate Average score
  const getClassAverage = () => {
    if (reportData.length === 0) return 0;
    const total = reportData.reduce((acc, curr) => acc + curr.score, 0);
    return parseFloat((total / reportData.length).toFixed(1));
  };

  // CSV Export
  const exportToCSV = () => {
    if (reportData.length === 0) return;

    const headers = ["Rank", "Student Name", "Class", "Subject", "Score", "Grade Letter"];
    const rows = reportData.map((row) => [
      row.rank,
      row.studentName,
      row.className,
      row.subject,
      row.score,
      row.gradeLetter,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Grades_Report_Class_${classFilter}_Subject_${subjectFilter}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export
  const exportToPDF = () => {
    if (reportData.length === 0) return;

    const doc = new jsPDF();

    // Fetch filters text
    const selectedClassObj = classes.find((c) => c.id.toString() === classFilter);
    const classNameText = selectedClassObj ? selectedClassObj.name : "All Classes";
    const subjectText = subjectFilter === "All" ? "All Subjects" : subjectFilter;

    // 1. Branding Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("EDUNEXUS SCHOOL ASSISTANT", 15, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Academic Grade Performance Reports", 15, 32);

    // 2. Metadata Section
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT PERFORMANCE & GRADES REPORT", 15, 55);

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(15, 59, 195, 59);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Class Filter:", 15, 68);
    doc.setFont("helvetica", "normal");
    doc.text(classNameText, 42, 68);

    doc.setFont("helvetica", "bold");
    doc.text("Subject Filter:", 15, 74);
    doc.setFont("helvetica", "normal");
    doc.text(subjectText, 42, 74);

    doc.setFont("helvetica", "bold");
    doc.text("Generated At:", 115, 68);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleString(), 145, 68);

    doc.line(15, 79, 195, 79);

    // 3. Stats cards
    const totalGrades = reportData.length;
    const classAvg = getClassAverage();
    const topScore = Math.max(...reportData.map((r) => r.score));

    doc.setFillColor(248, 250, 252); // slate-50 background for card
    doc.rect(15, 85, 55, 18, "F");
    doc.rect(77, 85, 56, 18, "F");
    doc.rect(139, 85, 56, 18, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("TOTAL GRADES", 20, 91);
    doc.text("AVERAGE SCORE", 82, 91);
    doc.text("TOP SCORE ACHIEVED", 144, 91);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(totalGrades.toString(), 20, 99);

    // Color average dynamically
    let avgColor = [16, 185, 129];
    if (classAvg < 60) avgColor = [239, 68, 68];
    else if (classAvg < 80) avgColor = [245, 158, 11];
    doc.setTextColor(avgColor[0], avgColor[1], avgColor[2]);
    doc.text(`${classAvg}%`, 82, 99);

    doc.setTextColor(15, 23, 42);
    doc.text(`${topScore}%`, 144, 99);

    // 4. Data Table
    const headers = [["Rank", "Student Name", "Class", "Subject", "Score", "Grade Letter"]];
    const rows = reportData.map((row) => [
      row.rank,
      row.studentName,
      row.className,
      row.subject,
      `${row.score}%`,
      row.gradeLetter,
    ]);

    autoTable(doc, {
      startY: 110,
      head: headers,
      body: rows,
      theme: "striped",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { halign: "center", fontStyle: "bold" },
        4: { halign: "right", fontStyle: "bold" },
        5: { halign: "center", fontStyle: "bold" },
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      didParseCell: (data) => {
        // Style grade letters individually
        if (data.column.index === 5 && data.cell.section === "body") {
          const letter = data.cell.text[0];
          if (letter === "A" || letter === "B") {
            data.cell.styles.textColor = [16, 185, 129]; // green
          } else if (letter === "C" || letter === "D") {
            data.cell.styles.textColor = [245, 158, 11]; // amber
          } else {
            data.cell.styles.textColor = [239, 68, 68]; // red
          }
        }
      },
    });

    // 5. Page number
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

    doc.save(
      `Grades_Report_Class_${classNameText.replace(/\s+/g, "_")}_Subject_${subjectText.replace(
        /\s+/g,
        "_"
      )}.pdf`
    );
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Grades Reports</h1>
          <p className="text-slate-400 text-sm mt-1">
            Analyze ranks and average grades across subjects and classes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/admin/grades")}
            className="bg-slate-900/50 hover:bg-slate-800/50 text-slate-200 font-semibold py-2.5 px-5 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
          >
            ← Back to Entry
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

      {/* Filters */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-5 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Subject Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
            Subject Filter
          </label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full h-11 bg-slate-950/50 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 text-sm text-slate-200 outline-none transition-all cursor-pointer"
          >
            {SUBJECT_OPTIONS.map((sub) => (
              <option key={sub} value={sub}>
                {sub === "All" ? "All Subjects" : sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 px-5 py-4 rounded-xl text-sm shadow-lg">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
              <tr>
                <th className="px-6 py-4 text-center rounded-l-lg">Rank</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center rounded-r-lg">Grade Letter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoadingReport ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 mt-2">Generating grades report...</p>
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    No grade records found matching the filters.
                  </td>
                </tr>
              ) : (
                <>
                  {reportData.map((row, idx) => {
                    let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                    if (row.gradeLetter === "F") {
                      badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                    } else if (row.gradeLetter === "C" || row.gradeLetter === "D") {
                      badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                    }

                    return (
                      <tr key={idx} className="hover:bg-white/[0.01] transition-colors animate-fade-in">
                        <td className="px-6 py-4 text-center font-bold text-slate-200">
                          #{row.rank}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-200">
                          {row.studentName}
                        </td>
                        <td className="px-6 py-4 text-slate-400">{row.className}</td>
                        <td className="px-6 py-4 text-slate-400">{row.subject}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-200">
                          {row.score}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${badgeColor}`}>
                            {row.gradeLetter}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Summary/Class Average Row */}
                  <tr className="bg-slate-950/40 font-bold border-t border-white/10">
                    <td colSpan={4} className="px-6 py-4.5 text-right text-slate-300 font-extrabold">
                      Class Average Score:
                    </td>
                    <td className="px-6 py-4.5 text-center text-blue-400 text-lg">
                      {getClassAverage()}%
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border bg-blue-500/10 text-blue-400 border-blue-500/20">
                        Avg
                      </span>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

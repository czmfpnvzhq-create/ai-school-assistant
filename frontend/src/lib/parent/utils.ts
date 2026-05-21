export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getGradeLetter(score: number) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

export function getScoreColorClass(score: number) {
  if (score >= 80) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (score >= 60) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  return "bg-rose-500/10 text-rose-400 border-rose-500/20";
}

export function getAttendanceStatusStyle(status: string) {
  if (status === "present") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (status === "late") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-rose-500/10 text-rose-400 border-rose-500/20";
}

export function getAttendanceStatusLabel(status: string) {
  if (status === "present") return "Present";
  if (status === "late") return "Late";
  return "Absent";
}

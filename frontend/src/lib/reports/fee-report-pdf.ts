import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface FeeReportData {
  totalFees: number;
  collectedAmount: number;
  pendingAmount: number;
  pendingRecords: number;
  collectionRatePercent: number;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function downloadFeeReportPdf(
  data: FeeReportData,
  meta?: { generatedBy?: string; generatedAt?: Date }
) {
  const doc = new jsPDF();
  const at = meta?.generatedAt ?? new Date();
  const totalAmount = data.collectedAmount + data.pendingAmount;

  doc.setFontSize(18);
  doc.text("EduNexus — Fee Collection Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${at.toLocaleString()}`, 14, 28);
  if (meta?.generatedBy) {
    doc.text(`Prepared for: ${meta.generatedBy}`, 14, 34);
  }

  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(`Collection rate: ${data.collectionRatePercent}%`, 14, 46);

  autoTable(doc, {
    startY: 52,
    head: [["Metric", "Value"]],
    body: [
      ["Total fee records", String(data.totalFees)],
      ["Total billed amount", formatMoney(totalAmount)],
      ["Collected", formatMoney(data.collectedAmount)],
      ["Pending", formatMoney(data.pendingAmount)],
      ["Pending records", String(data.pendingRecords)],
      ["Collection rate", `${data.collectionRatePercent}%`],
    ],
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] },
  });

  doc.setFontSize(9);
  doc.setTextColor(120);
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY;
  doc.text(
    "Data sourced from live school database via EduNexus AI Assistant.",
    14,
    (finalY ?? 120) + 12
  );

  doc.save(`edunexus-fee-report-${at.toISOString().slice(0, 10)}.pdf`);
}

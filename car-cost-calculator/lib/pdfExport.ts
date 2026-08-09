"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CarCostResponse } from "@/types/car";

const BRAND = {
  ink: "#10151A",
  moss: "#2F5D50",
  rust: "#B5502F",
  brass: "#C08A3E",
  muted: "#6B7280",
};

function fmt(n: number, currency: string) {
  return `${currency} ${Math.round(n).toLocaleString()}`;
}

/** Loads /logo.png and returns it as a base64 data URL jsPDF can embed. */
async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function downloadCarCostPdf(data: CarCostResponse, currency: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  // ---- Header: logo + brand ----
  const logo = await loadLogoDataUrl();
  if (logo) {
    try {
      doc.addImage(logo, "PNG", margin, y - 24, 32, 32);
    } catch {
      // If the image fails to decode for any reason, just skip it — the
      // report still works without a logo.
    }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(BRAND.ink);
  doc.text("CarCost Calculator", margin + (logo ? 42 : 0), y - 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(BRAND.muted);
  doc.text("Know the real cost. Drive smarter.", margin + (logo ? 42 : 0), y + 10);

  y += 40;
  doc.setDrawColor(230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 30;

  // ---- Title + vehicle info ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(BRAND.ink);
  doc.text("Car Ownership Cost Report", margin, y);
  y += 20;

  const vehicleLine = [data.vehicle.make, data.vehicle.model, data.vehicle.variant]
    .filter(Boolean)
    .join(" ");
  const locationLine = `${data.vehicle.city}, ${data.vehicle.country}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(BRAND.muted);
  doc.text(`${vehicleLine} · ${data.vehicle.fuelType} · ${locationLine}`, margin, y);
  y += 14;
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, y);
  y += 30;

  // ---- Big summary numbers ----
  doc.setFillColor(247, 245, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 70, 8, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(BRAND.ink);
  doc.text(`${fmt(data.total.monthly, currency)} / month`, margin + 16, y + 30);
  doc.setFontSize(12);
  doc.setTextColor(BRAND.muted);
  doc.text(`${fmt(data.total.annual, currency)} / year`, margin + 16, y + 50);
  doc.setTextColor(BRAND.moss);
  doc.setFont("helvetica", "bold");
  doc.text(`${currency} ${data.total.costPerKm.toFixed(2)} / km`, pageWidth - margin - 16, y + 40, {
    align: "right",
  });
  y += 90;

  // ---- Cost breakdown table ----
  const insuranceMonthly = data.insurance.status === "unavailable" ? null : data.insurance.monthly;
  const rows: (string | number)[][] = [
    [data.fuel.label, fmt(data.fuel.monthly, currency), fmt(data.fuel.annual, currency)],
    ["Maintenance", fmt(data.maintenance.monthly, currency), fmt(data.maintenance.annual, currency)],
    [
      "Insurance",
      insuranceMonthly !== null ? fmt(insuranceMonthly, currency) : "Unavailable",
      data.insurance.status !== "unavailable" ? fmt(data.insurance.annual, currency) : "Unavailable",
    ],
    [
      "Government (recurring)",
      fmt(data.government.monthly, currency),
      fmt(data.government.annual, currency),
    ],
    ["Financing", fmt(data.financing.monthly, currency), fmt(data.financing.annual, currency)],
    ["Total", fmt(data.total.monthly, currency), fmt(data.total.annual, currency)],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Expense", "Monthly", "Annual"]],
    body: rows,
    margin: { left: margin, right: margin },
    styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [16, 21, 26], textColor: 255 },
    didParseCell: (hookData) => {
      if (hookData.row.index === rows.length - 1) {
        hookData.cell.styles.fontStyle = "bold";
        hookData.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 20;

  if (data.government.oneTimeRegistration > 0 && data.government.oneTimeStatus !== "unavailable") {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(BRAND.muted);
    doc.text(
      `One-time registration fee: ${fmt(data.government.oneTimeRegistration, currency)} (not included above)`,
      margin,
      y
    );
    y += 20;
  }

  // ---- 3-year / 5-year projection ----
  if (y > 650) {
    doc.addPage();
    y = 50;
  }
  const boxWidth = (pageWidth - margin * 2 - 16) / 2;
  doc.setFillColor(16, 21, 26);
  doc.roundedRect(margin, y, boxWidth, 60, 8, 8, "F");
  doc.setTextColor(255);
  doc.setFontSize(10);
  doc.text("Estimated 3-year cost", margin + 14, y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(fmt(data.total.threeYear, currency), margin + 14, y + 44);

  doc.setFillColor(181, 80, 47);
  doc.roundedRect(margin + boxWidth + 16, y, boxWidth, 60, 8, 8, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Estimated 5-year cost", margin + boxWidth + 30, y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(fmt(data.total.fiveYear, currency), margin + boxWidth + 30, y + 44);
  y += 90;

  // ---- Disclaimer / footer ----
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BRAND.muted);
  const disclaimer =
    "Estimates are based on user-provided information and available market/web data. Actual costs may vary depending on fuel prices, driving conditions, maintenance requirements, insurance provider, government charges and other factors. Generated by CarCost Calculator.";
  const wrapped = doc.splitTextToSize(disclaimer, pageWidth - margin * 2);
  doc.text(wrapped, margin, y);

  const filename = `CarCost-${data.vehicle.make}-${data.vehicle.model}-${Date.now()}.pdf`
    .replace(/\s+/g, "-");
  doc.save(filename);
}

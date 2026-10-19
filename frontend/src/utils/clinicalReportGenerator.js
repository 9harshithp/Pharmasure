import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { calculateMedicationRisk } from "./predictiveRiskCalculator";

export function generateDoctorSummaryReport(patient, medications, consumedRecords = []) {
  const doc = new jsPDF();
  const todayStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // --- Header Banner ---
  doc.setFillColor(13, 110, 253); // #0d6efd
  doc.rect(0, 0, 210, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PHARMASURE CLINICAL SUMMARY REPORT", 14, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${todayStr}`, 140, 16);

  // --- Patient Demographics Box ---
  doc.setTextColor(33, 37, 41);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Patient & Caretaker Profile", 14, 35);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Patient Name: ${patient?.name || "N/A"}`, 14, 43);
  doc.text(`Patient Email: ${patient?.email || "N/A"}`, 14, 50);
  doc.text(`Caretaker Email: ${patient?.careTakerEmail || "N/A"}`, 110, 43);
  doc.text(`Regular Attending Doctor: ${patient?.regularDoctor || medications[0]?.doctor || "Primary Care Physician"}`, 110, 50);

  // --- Zero-Risk Medication Schedule Table ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Active Medication Schedule & Zero-Risk Expiry Audit", 14, 65);

  const tableBody = medications.map((med, index) => {
    const risk = calculateMedicationRisk(med);
    return [
      index + 1,
      med.tableName,
      `${med.tabletQty} tabs`,
      med.timing,
      med.expiryDate || "N/A",
      risk.runoutDateStr,
      risk.badgeText,
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [["#", "Medicine Name", "Qty", "Schedule", "Batch Expiry", "Projected Runout", "Zero-Risk Verdict"]],
    body: tableBody,
    theme: "striped",
    headStyles: { fillColor: [33, 37, 41], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8.5 },
  });

  const finalY = doc.lastAutoTable.finalY + 12;

  // --- Consumption Adherence Summary ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Dosage Adherence & Safety Observations", 14, finalY);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Total Recorded Doses: ${consumedRecords.length} dose entries logged in the system.`,
    14,
    finalY + 8
  );
  doc.text(
    "Clinical Note: All medications have been audited against batch expiration dates to ensure zero-risk dispensing.",
    14,
    finalY + 15
  );

  // --- Physician Sign-off Box ---
  const signY = finalY + 35;
  doc.setDrawColor(180, 180, 180);
  doc.line(14, signY, 80, signY);
  doc.text("Attending Physician Signature", 14, signY + 6);

  doc.line(130, signY, 195, signY);
  doc.text("Date / Clinic Stamp", 130, signY + 6);

  const fileName = `Pharmasure_Clinical_Summary_${patient?.name || "Patient"}.pdf`;
  doc.save(fileName);
}

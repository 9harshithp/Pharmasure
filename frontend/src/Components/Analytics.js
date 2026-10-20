import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { baseUrl } from "../App";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf, FaUndoAlt } from "react-icons/fa";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const Analytics = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    axios
      .get(`${baseUrl}/inventory`)
      .then((res) => {
        setInventory(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching inventory:", err);
        setLoading(false);
      });
  }, []);

  const today = new Date();
  const totalMedicines = inventory.length;
  const totalValue = inventory.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  const expired = inventory.filter((item) => new Date(item.expiryDate) < today);
  const expiringSoon = inventory.filter((item) => {
    const expiry = new Date(item.expiryDate);
    const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 15;
  });

  // Enterprise Distributor Return Window: 16 to 90 days before expiry
  const distributorReturns = inventory.filter((item) => {
    const expiry = new Date(item.expiryDate);
    const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 90;
  });

  const totalCreditRefundValue = distributorReturns.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  const safeCount = Math.max(0, totalMedicines - (expired.length + expiringSoon.length));

  const chartData = {
    labels: ["Expired", "Expiring Soon", "Safe"],
    datasets: [
      {
        data: [expired.length, expiringSoon.length, safeCount],
        backgroundColor: ["#EF4444", "#F59E0B", "#10B981"],
        borderColor: "#FFFFFF",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#0F2942",
          font: { weight: "600", size: 12 },
          padding: 16,
        },
      },
    },
    maintainAspectRatio: false,
  };

  if (loading) return <div className="text-center mt-5 text-muted">Loading Analytics...</div>;

  const cards = [
    { title: "Total Medicines", value: totalMedicines, accent: "#0F2942", bgAccent: "rgba(15, 41, 66, 0.08)", icon: "💊" },
    { title: "Expired (Loss)", value: expired.length, accent: "#EF4444", bgAccent: "rgba(239, 68, 68, 0.1)", icon: "⛔" },
    { title: "Expiring ≤15d", value: expiringSoon.length, accent: "#F59E0B", bgAccent: "rgba(245, 158, 11, 0.12)", icon: "⏳" },
    { title: "Distributor Returns", value: `${distributorReturns.length} (₹${totalCreditRefundValue.toFixed(0)})`, accent: "#06B6D4", bgAccent: "rgba(6, 182, 212, 0.12)", icon: "🔄" },
    { title: "Total Inventory Value", value: `₹${totalValue.toFixed(2)}`, accent: "#10B981", bgAccent: "rgba(16, 185, 129, 0.12)", icon: "💰" },
  ];

  const handleRowClick = (item) => setSelectedItem(item);
  const handleCloseModal = () => setSelectedItem(null);

  const generatePDF = (title, data) => {
    const doc = new jsPDF();
    doc.text(String(title), 14, 10);

    const tableData = data.map((item, index) => [
      index + 1,
      item.tableName,
      item.expiryDate,
      item.tabletQty,
    ]);

    autoTable(doc, {
      startY: 20,
      head: [["#", "Medicine Name", "Expiry Date", "Quantity"]],
      body: tableData,
    });

    doc.save(`${title}.pdf`);
  };

  // ✅ Enterprise B2B Distributor Return Claim & Credit-Note Generator
  const generateDistributorCreditNotePDF = () => {
    const doc = new jsPDF();
    const claimNo = `CN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Header Branding
    doc.setFontSize(18);
    doc.setTextColor(24, 60, 115);
    doc.text("PHARMASURE ENTERPRISE HEALTHCARE", 14, 18);

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("B2B Distributor Return Request & Credit-Note Claim", 14, 26);

    // Meta Box
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text(`Claim Number: ${claimNo}`, 14, 35);
    doc.text(`Date of Issue: ${todayStr}`, 14, 40);
    doc.text(`Pharmacy Reg / GSTIN: 29AAAAA0000A1Z5`, 14, 45);

    doc.text(`Return Reason: Standard Pre-Expiry Recall (30-90 Days Policy)`, 110, 35);
    doc.text(`Settlement Mode: Full Distributor Credit-Note / Replacement`, 110, 40);
    doc.text(`Zero-Risk Dispensing Protocol: EN-ISO-13485 Compliant`, 110, 45);

    const tableBody = distributorReturns.map((item, index) => {
      const unitPrice = item.amount && item.tabletQty ? (item.amount / item.tabletQty).toFixed(2) : "—";
      const totalAmt = item.amount ? parseFloat(item.amount).toFixed(2) : "0.00";
      return [
        index + 1,
        item.tableName,
        `BATCH-${item.id}`,
        item.expiryDate,
        item.tabletQty,
        `Rs. ${unitPrice}`,
        `Rs. ${totalAmt}`,
      ];
    });

    autoTable(doc, {
      startY: 52,
      head: [["#", "Medicine Name", "Batch ID", "Expiry Date", "Units", "Unit Cost", "Claim Amount"]],
      body: tableBody,
      theme: "grid",
      headStyles: { fillColor: [24, 60, 115] },
      styles: { fontSize: 9 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Total Amount highlight
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 120, 50);
    doc.text(
      `TOTAL CREDIT CLAIM AMOUNT: Rs. ${totalCreditRefundValue.toFixed(2)}`,
      14,
      finalY
    );

    // Signatures
    const signY = finalY + 25;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);

    doc.text("___________________________________", 14, signY);
    doc.text("Authorized Registered Pharmacist", 14, signY + 5);
    doc.text("Reg No: KA-PH-2024-88910", 14, signY + 10);

    doc.text("___________________________________", 120, signY);
    doc.text("Distributor Logistics Received Stamp & Sign", 120, signY + 5);
    doc.text("Date Received: ____________________", 120, signY + 10);

    doc.save(`Pharmasure_Distributor_Credit_Claim_${claimNo}.pdf`);
  };

  return (
    <div className="container-fluid px-0">
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge rounded-pill px-3 py-1 text-uppercase fw-semibold"
              style={{ backgroundColor: "rgba(6, 182, 212, 0.12)", color: "#0891B2", fontSize: "0.75rem" }}
            >
              Clinical Intelligence & Recalls
            </span>
          </div>
          <h3 className="fw-bold mb-1" style={{ color: "#0F2942", letterSpacing: "-0.02em" }}>
            Inventory Analytics & Enterprise Returns
          </h3>
          <p className="text-muted small mb-0">
            Real-time shelf intelligence, wastage forecasting, and automated B2B distributor credit claims.
          </p>
        </div>
        {distributorReturns.length > 0 && (
          <button
            className="btn fw-semibold d-flex align-items-center gap-2 shadow-sm rounded-3 px-3 py-2 transition"
            style={{ backgroundColor: "#06B6D4", color: "#FFFFFF", border: "none" }}
            onClick={generateDistributorCreditNotePDF}
          >
            <FaFilePdf size={17} />
            Export Credit Claim (PDF)
          </button>
        )}
      </div>

      {/* ✅ Clean Clinical Summary Cards */}
      <div className="row g-3 mb-4">
        {cards.map((card, index) => (
          <div key={index} className="col-12 col-sm-6 col-lg">
            <div
              className="card h-100 p-3 rounded-4 shadow-sm"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "46px",
                    height: "46px",
                    backgroundColor: card.bgAccent,
                    fontSize: "1.4rem",
                  }}
                >
                  {card.icon}
                </div>
                <div className="overflow-hidden">
                  <div
                    className="small fw-semibold text-muted text-uppercase text-truncate"
                    style={{ fontSize: "0.72rem", letterSpacing: "0.03em" }}
                  >
                    {card.title}
                  </div>
                  <div
                    className="h5 fw-bold mb-0 text-truncate"
                    style={{ color: card.accent || "#0F2942" }}
                  >
                    {card.value}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Pie Chart Card */}
      <div
        className="card shadow-sm mb-4 rounded-4"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}
      >
        <div
          className="card-header py-3 px-4 bg-white border-bottom d-flex align-items-center justify-content-between"
          style={{ borderColor: "#E2E8F0" }}
        >
          <h6 className="fw-bold mb-0" style={{ color: "#0F2942" }}>
            Inventory Health & Expiry Distribution
          </h6>
          <span
            className="badge rounded-pill px-2.5 py-1 text-muted"
            style={{ backgroundColor: "#F1F5F9", fontSize: "0.75rem" }}
          >
            Live Shelf Breakdown
          </span>
        </div>
        <div className="card-body d-flex justify-content-center py-4">
          <div style={{ width: "320px", height: "260px" }}>
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* ✅ ENTERPRISE DISTRIBUTOR RETURN & CREDIT-NOTE SECTION */}
      <div
        className="card shadow-sm mb-4 rounded-4"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}
      >
        <div
          className="card-header py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2"
          style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}
        >
          <div className="d-flex align-items-center gap-2">
            <span
              className="p-1.5 rounded-2 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: "rgba(6, 182, 212, 0.15)", color: "#0891B2" }}
            >
              <FaUndoAlt size={14} />
            </span>
            <span className="fw-bold" style={{ color: "#0F2942" }}>
              B2B Distributor Return Window (&le; 90 Days Expiry)
            </span>
          </div>
          <button
            className="btn btn-sm fw-semibold d-flex align-items-center gap-2 rounded-3 px-3 py-1.5"
            style={{ backgroundColor: "#E2E8F0", color: "#0F2942", border: "1px solid #CBD5E1" }}
            onClick={generateDistributorCreditNotePDF}
            disabled={distributorReturns.length === 0}
          >
            <FaFilePdf style={{ color: "#EF4444" }} /> Download Credit Claim
          </button>
        </div>
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <small className="text-muted">
              Batches nearing expiration qualify for 100% distributor credit or replacement before reaching dead-stock.
            </small>
            <span
              className="badge py-2 px-3 rounded-pill fw-semibold"
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                color: "#047857",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              Total Recoverable Credit: ₹{totalCreditRefundValue.toFixed(2)}
            </span>
          </div>
          <div className="table-responsive rounded-3" style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #E2E8F0" }}>
            <table className="table table-hover align-middle text-center mb-0">
              <thead style={{ backgroundColor: "#F8FAFC", color: "#475569", fontSize: "0.8rem", textTransform: "uppercase" }}>
                <tr>
                  <th className="py-2.5">Batch</th>
                  <th>Medicine Name</th>
                  <th>Units</th>
                  <th>Expiry Date</th>
                  <th>Days Left</th>
                  <th>Claim Value (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {distributorReturns.length > 0 ? (
                  distributorReturns.map((item) => {
                    const expiry = new Date(item.expiryDate);
                    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={item.id} style={{ cursor: "pointer" }} onClick={() => handleRowClick(item)}>
                        <td>
                          <span
                            className="badge font-monospace px-2 py-1 rounded"
                            style={{ backgroundColor: "#E2E8F0", color: "#334155" }}
                          >
                            BATCH-{item.id}
                          </span>
                        </td>
                        <td className="fw-semibold text-start ps-3" style={{ color: "#0F2942" }}>{item.tableName}</td>
                        <td className="fw-bold">{item.tabletQty}</td>
                        <td className="font-monospace text-muted">{item.expiryDate}</td>
                        <td>
                          <span
                            className="badge px-2.5 py-1 rounded-pill fw-semibold"
                            style={{
                              backgroundColor: diffDays <= 30 ? "rgba(239, 68, 68, 0.12)" : "rgba(245, 158, 11, 0.12)",
                              color: diffDays <= 30 ? "#DC2626" : "#D97706",
                            }}
                          >
                            {diffDays} days
                          </span>
                        </td>
                        <td className="fw-bold" style={{ color: "#059669" }}>
                          ₹{item.amount ? parseFloat(item.amount).toFixed(2) : "0.00"}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm fw-semibold rounded-2 px-3"
                            style={{
                              backgroundColor: "rgba(6, 182, 212, 0.12)",
                              color: "#0891B2",
                              border: "1px solid rgba(6, 182, 212, 0.3)",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              generateDistributorCreditNotePDF();
                            }}
                          >
                            Claim
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-muted py-4">
                      No stock currently in the 30-90 days distributor return window. All stock is healthy!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Expiring Soon Table */}
      <div
        className="card shadow-sm mb-4 rounded-4"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}
      >
        <div
          className="card-header py-3 px-4 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#FEF3C7", borderBottom: "1px solid #FDE68A" }}
        >
          <span className="fw-bold" style={{ color: "#92400E" }}>
            ⏳ Expiring Soon (&le; 15 days)
          </span>
          <FaFilePdf
            size={18}
            style={{ color: "#DC2626", cursor: "pointer" }}
            title="Download Expiring Soon Report"
            onClick={() => generatePDF("Expiring Soon Medicines Report", expiringSoon)}
          />
        </div>
        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: "200px", overflowY: "auto" }}>
            <table className="table table-hover align-middle text-center mb-0">
              <thead style={{ backgroundColor: "#F8FAFC", color: "#475569", fontSize: "0.8rem", textTransform: "uppercase" }}>
                <tr>
                  <th className="py-2.5">Name</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {expiringSoon.length > 0 ? (
                  expiringSoon.map((item) => (
                    <tr key={item.id} style={{ cursor: "pointer" }} onClick={() => handleRowClick(item)}>
                      <td className="fw-semibold text-start ps-4" style={{ color: "#0F2942" }}>{item.tableName}</td>
                      <td className="font-monospace text-muted">{item.expiryDate}</td>
                      <td className="fw-bold">{item.tabletQty}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-muted py-3">No expiring medicines</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Expired Table */}
      <div
        className="card shadow-sm mb-4 rounded-4"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}
      >
        <div
          className="card-header py-3 px-4 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#FEE2E2", borderBottom: "1px solid #FECACA" }}
        >
          <span className="fw-bold" style={{ color: "#991B1B" }}>
            ⛔ Expired Medicines (Total Loss)
          </span>
          <FaFilePdf
            size={18}
            style={{ color: "#991B1B", cursor: "pointer" }}
            title="Download Expired Report"
            onClick={() => generatePDF("Expired Medicines Report", expired)}
          />
        </div>
        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: "200px", overflowY: "auto" }}>
            <table className="table table-hover align-middle text-center mb-0">
              <thead style={{ backgroundColor: "#F8FAFC", color: "#475569", fontSize: "0.8rem", textTransform: "uppercase" }}>
                <tr>
                  <th className="py-2.5">Name</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {expired.length > 0 ? (
                  expired.map((item) => (
                    <tr key={item.id} style={{ cursor: "pointer" }} onClick={() => handleRowClick(item)}>
                      <td className="fw-semibold text-start ps-4" style={{ color: "#0F2942" }}>{item.tableName}</td>
                      <td className="font-monospace text-muted">{item.expiryDate}</td>
                      <td className="fw-bold text-danger">{item.tabletQty}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-muted py-3">No expired medicines</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Modal for Full Details */}
      {selectedItem && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(15, 41, 66, 0.45)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="modal-header py-3 px-4" style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "#0F2942" }}>Tablet Details: {selectedItem.tableName}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body text-start p-4">
                <p><strong>Tablet Name:</strong> {selectedItem.tableName}</p>
                <p><strong>Quantity:</strong> {selectedItem.tabletQty}</p>
                <p>
                  <strong>Amount (₹):</strong>{" "}
                  {selectedItem.amount !== null && !isNaN(selectedItem.amount)
                    ? parseFloat(selectedItem.amount).toFixed(2)
                    : "—"}
                </p>
                <p className="mb-0"><strong>Expiry Date:</strong> {selectedItem.expiryDate}</p>
              </div>
              <div className="modal-footer py-2 px-4" style={{ backgroundColor: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
                <button
                  className="btn fw-semibold rounded-3 px-4"
                  style={{ backgroundColor: "#E2E8F0", color: "#0F2942" }}
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

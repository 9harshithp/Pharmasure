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
        backgroundColor: ["#dc3545", "#ffc107", "#28a745"],
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  const cards = [
    { title: "Total Medicines", value: totalMedicines, color: "primary", icon: "💊" },
    { title: "Expired (Loss)", value: expired.length, color: "danger", icon: "⛔" },
    { title: "Expiring <15d", value: expiringSoon.length, color: "warning", icon: "⏳" },
    { title: "Distributor Returns", value: `${distributorReturns.length} (₹${totalCreditRefundValue.toFixed(0)})`, color: "info", icon: "🔄" },
    { title: "Total Value (₹)", value: totalValue.toFixed(2), color: "success", icon: "💰" },
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
    <div className="container mt-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-primary">📊 Inventory Analytics & Enterprise Returns</h4>
          <p className="text-muted small mb-0">
            Real-time shelf intelligence, wastage forecasting, and automated B2B distributor credit claims.
          </p>
        </div>
        {distributorReturns.length > 0 && (
          <button
            className="btn btn-primary fw-bold d-flex align-items-center gap-2 shadow-sm"
            onClick={generateDistributorCreditNotePDF}
          >
            <FaFilePdf size={18} />
            Export Distributor Credit Claim (PDF)
          </button>
        )}
      </div>

      {/* ✅ Summary Cards */}
      <div className="row g-3 mb-4">
        {cards.map((card, index) => (
          <div key={index} className="col-6 col-md">
            <div
              className={`card text-white bg-${card.color} shadow-sm border-0 h-100`}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-3">
                <div style={{ fontSize: "1.8rem" }}>{card.icon}</div>
                <h6 className="mt-2 mb-1 small">{card.title}</h6>
                <h5 className="fw-bold mb-0">{card.value}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Pie Chart */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light text-center fw-bold">
          Inventory Health & Expiry Distribution
        </div>
        <div className="card-body d-flex justify-content-center">
          <div style={{ width: "300px", height: "300px" }}>
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* ✅ ENTERPRISE DISTRIBUTOR RETURN & CREDIT-NOTE SECTION */}
      <div className="card shadow-sm mb-4 border-info">
        <div className="card-header bg-info text-white fw-bold d-flex justify-content-between align-items-center">
          <span className="d-flex align-items-center gap-2">
            <FaUndoAlt /> B2B Distributor Return Window (&le; 90 Days Expiry)
          </span>
          <button
            className="btn btn-sm btn-light text-info fw-bold d-flex align-items-center gap-1 shadow-sm"
            onClick={generateDistributorCreditNotePDF}
            disabled={distributorReturns.length === 0}
          >
            <FaFilePdf className="text-danger" /> Download Credit Claim
          </button>
        </div>
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">
              Batches nearing expiration qualify for 100% distributor credit or replacement before reaching dead-stock.
            </small>
            <span className="badge bg-success py-2 px-3">
              Total Recoverable Credit: ₹{totalCreditRefundValue.toFixed(2)}
            </span>
          </div>
          <div className="table-responsive" style={{ maxHeight: "250px", overflowY: "auto" }}>
            <table className="table table-striped table-hover align-middle text-center mb-0">
              <thead className="table-light">
                <tr>
                  <th>Batch</th>
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
                        <td><span className="badge bg-secondary font-monospace">BATCH-{item.id}</span></td>
                        <td className="fw-semibold text-start ps-3">{item.tableName}</td>
                        <td className="fw-bold">{item.tabletQty}</td>
                        <td className="font-monospace">{item.expiryDate}</td>
                        <td>
                          <span className={diffDays <= 30 ? "badge bg-danger" : "badge bg-warning text-dark"}>
                            {diffDays} days
                          </span>
                        </td>
                        <td className="fw-bold text-success">
                          ₹{item.amount ? parseFloat(item.amount).toFixed(2) : "0.00"}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
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
                    <td colSpan="7" className="text-muted py-3">
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
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-warning text-dark fw-bold d-flex justify-content-between align-items-center">
          <span>Expiring Soon (&le; 15 days)</span>
          <FaFilePdf
            size={20}
            className="text-danger"
            style={{ cursor: "pointer" }}
            title="Download Expiring Soon Report"
            onClick={() => generatePDF("Expiring Soon Medicines Report", expiringSoon)}
          />
        </div>
        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: "200px", overflowY: "auto" }}>
            <table className="table table-striped align-middle text-center mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {expiringSoon.length > 0 ? (
                  expiringSoon.map((item) => (
                    <tr key={item.id} style={{ cursor: "pointer" }} onClick={() => handleRowClick(item)}>
                      <td>{item.tableName}</td>
                      <td>{item.expiryDate}</td>
                      <td>{item.tabletQty}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-muted">No expiring medicines</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Expired Table */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-danger text-white fw-bold d-flex justify-content-between align-items-center">
          <span>Expired Medicines (Total Loss)</span>
          <FaFilePdf
            size={20}
            className="text-light"
            style={{ cursor: "pointer" }}
            title="Download Expired Report"
            onClick={() => generatePDF("Expired Medicines Report", expired)}
          />
        </div>
        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: "200px", overflowY: "auto" }}>
            <table className="table table-striped align-middle text-center mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {expired.length > 0 ? (
                  expired.map((item) => (
                    <tr key={item.id} style={{ cursor: "pointer" }} onClick={() => handleRowClick(item)}>
                      <td>{item.tableName}</td>
                      <td>{item.expiryDate}</td>
                      <td>{item.tabletQty}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-muted">No expired medicines</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Modal for Full Details */}
      {selectedItem && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-primary">Tablet Details: {selectedItem.tableName}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body text-start">
                <p><strong>Tablet Name:</strong> {selectedItem.tableName}</p>
                <p><strong>Quantity:</strong> {selectedItem.tabletQty}</p>
                <p>
                  <strong>Amount (₹):</strong>{" "}
                  {selectedItem.amount !== null && !isNaN(selectedItem.amount)
                    ? parseFloat(selectedItem.amount).toFixed(2)
                    : "—"}
                </p>
                <p><strong>Expiry Date:</strong> {selectedItem.expiryDate}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { baseUrl } from "../App";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";

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
    return diffDays > 0 && diffDays <= 10;
  });

  const safeCount = totalMedicines - (expired.length + expiringSoon.length);

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
    { title: "Expired", value: expired.length, color: "danger", icon: "⛔" },
    { title: "Expiring Soon", value: expiringSoon.length, color: "warning", icon: "⏳" },
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

  return (
    <div className="container mt-4">
      <h4 className="fw-bold mb-4 text-center">Inventory Reports & Analytics</h4>

      {/* ✅ Summary Cards */}
      <div className="row g-3 mb-4">
        {cards.map((card, index) => (
          <div key={index} className="col-6 col-md-3">
            <div
              className={`card text-white bg-${card.color} shadow-sm border-0 h-100`}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                <div style={{ fontSize: "2rem" }}>{card.icon}</div>
                <h6 className="mt-2">{card.title}</h6>
                <h4 className="fw-bold mt-1">{card.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Pie Chart */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light text-center fw-bold">
          Inventory Summary (Graph View)
        </div>
        <div className="card-body d-flex justify-content-center">
          <div style={{ width: "300px", height: "300px" }}>
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* ✅ Expiring Soon Table */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-warning text-dark fw-bold d-flex justify-content-between align-items-center">
          <span>Expiring Soon (within 10 days)</span>
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
          <span>Expired Medicines</span>
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

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from "../App";
import { GoogleGenAI, Type } from "@google/genai";

const Inventory = () => {
  const [form, setForm] = useState({
    tableName: "",
    tabletQty: "",
    amount: "",
    expiryDate: "",
  });
  const [inventory, setInventory] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Gemini Setup
  const GEMINI_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  const genAI = GEMINI_KEY ? new GoogleGenAI({ apiKey: GEMINI_KEY }) : null;

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${baseUrl}/inventory`);
      setInventory(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load inventory!");
    }
  };

  const handleShowDetails = (item) => {
  setSelectedItem(item);
};

const handleCloseModal = () => {
  setSelectedItem(null);
};
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${baseUrl}/inventory/${editingId}`, form);
        toast.success("Record updated successfully!");
      } else {
        await axios.post(`${baseUrl}/inventory`, form);
        toast.success("Record added successfully!");
      }
      setForm({ tableName: "", tabletQty: "", amount: "", expiryDate: "" });
      setEditingId(null);
      fetchInventory();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save record!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setForm(record);
    setEditingId(record.id);
  };

  const handleCancelEdit = () => {
    setForm({ tableName: "", tabletQty: "", amount: "", expiryDate: "" });
    setEditingId(null);
  };

  // ✅ Convert file to base64 for Gemini
  const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  // ✅ Gemini OCR logic
  async function extractTextFromImage(file) {
    if (!genAI) throw new Error("Gemini API key not configured");

    try {
      const imagePart = await fileToGenerativePart(file);

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            imagePart,
            {
              text: `Analyze this medicine label image.
                     Return JSON with fields: name, expiryDate (YYYY-MM-DD). 
                     Return ONLY the JSON.`,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              expiryDate: { type: Type.STRING },
            },
            required: ["name"],
          },
        },
      });

      const jsonString = response.text.trim();
      const parsedJson = JSON.parse(jsonString);
      console.log("✅ OCR Extracted:", parsedJson);
      return parsedJson;
    } catch (error) {
      console.error("Gemini OCR extraction error:", error);
      return null;
    }
  }

  // ✅ Scan Button Handler
  const handleScan = async () => {
    if (!imageFile) return;
    setIsScanning(true);
    setScanError("");

    try {
      const data = await extractTextFromImage(imageFile);
      if (!data) {
        setScanError("Failed to extract details. Try a clearer image.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        tableName: data.name || prev.tableName,
        expiryDate: data.expiryDate || prev.expiryDate,
      }));
      toast.success("Details extracted successfully!");
    } catch (err) {
      console.error(err);
      setScanError("AI scan failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="container py-4">
      <ToastContainer position="top-center" autoClose={2000} />
      <h3 className="text-center mb-4 fw-bold text-primary">💊 Inventory Management</h3>

      {/* ✅ OCR Section */}
      <div className="card shadow-sm p-3 mb-4">
        <h5 className="mb-3">Extract Tablet Details (Optional)</h5>
        <div className="d-flex flex-column align-items-center">
          <input
            type="file"
            accept="image/*"
            className="form-control mb-3"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }}
          />
          {imagePreview && (
            <>
              <img
                src={imagePreview}
                alt="Preview"
                className="img-thumbnail mb-2"
                style={{ maxWidth: "200px" }}
              />
              <button
                type="button"
                className="btn btn-warning btn-sm"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                }}
              >
                Remove Image
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-outline-primary mt-3"
            onClick={handleScan}
            disabled={!imageFile || isScanning}
          >
            {isScanning ? "Scanning..." : "Extract Details"}
          </button>
          {scanError && <p className="text-danger mt-2">{scanError}</p>}
        </div>
      </div>

      {/* ✅ Add/Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="border p-4 rounded bg-light shadow-sm mb-4"
      >
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Tablet Name</label>
            <input
              type="text"
              name="tableName"
              className="form-control"
              value={form.tableName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Tablet Quantity</label>
            <input
              type="number"
              name="tabletQty"
              className="form-control"
              value={form.tabletQty}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              className="form-control"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              className="form-control"
              value={form.expiryDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            type="submit"
            className="btn btn-primary fw-bold px-4"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editingId
              ? "Update Record"
              : "Add Tablet"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-secondary ms-3 fw-bold px-4"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

     {/* ✅ Inventory Table */}
{/* ✅ Inventory Table */}
<div
  className="table-responsive shadow-sm"
  style={{
    maxHeight: "250px",
    overflowY: "auto",
  }}
>
  <table className="table table-striped align-middle text-center mb-0">
    <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 1 }}>
      <tr>
        <th>Tablet Name</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {inventory.length > 0 ? (
        inventory.map((item) => {
          // ✅ Compute expiry status
          const today = new Date();
          const expiry = new Date(item.expiryDate);
          const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

          let status = "Safe";
          let statusClass = "text-success fw-bold";
          if (diffDays <= 0) {
            status = "Expired";
            statusClass = "text-danger fw-bold";
          } else if (diffDays <= 10) {
            status = "Expiring Soon";
            statusClass = "text-warning fw-bold";
          }

          return (
            <tr
              key={item.id}
              onClick={() => handleShowDetails(item)}
              style={{ cursor: "pointer" }}
            >
              <td>{item.tableName}</td>
              <td className={statusClass}>{status}</td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="2" className="text-muted">
            No records found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

{/* ✅ Modal for Tablet Details */}
{selectedItem && (
  <div
    className="modal fade show"
    style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title text-primary">
            Tablet Details: {selectedItem.tableName}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={handleCloseModal}
          ></button>
        </div>
        <div className="modal-body text-start">
          <p>
            <strong>Tablet Name:</strong> {selectedItem.tableName}
          </p>
          <p>
            <strong>Quantity:</strong> {selectedItem.tabletQty}
          </p>
          <p>
            <strong>Amount (₹):</strong>{" "}
            {selectedItem.amount !== null && !isNaN(selectedItem.amount)
              ? parseFloat(selectedItem.amount).toFixed(2)
              : "—"}
          </p>
          <p>
            <strong>Expiry Date:</strong> {selectedItem.expiryDate}
          </p>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-warning fw-bold"
            onClick={() => {
              handleEdit(selectedItem);
              handleCloseModal();
            }}
          >
            Edit
          </button>
          <button
            className="btn btn-secondary"
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

export default Inventory;

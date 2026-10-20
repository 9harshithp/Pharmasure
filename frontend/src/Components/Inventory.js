import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from "../App";
import { performMedicationOCR } from "../utils/ocrScanner";
import { speakText, toggleSpeech } from "../utils/voiceAssistant";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import {
  FaShieldAlt,
  FaSortAmountDown,
  FaQrcode,
  FaCheckCircle,
  FaExclamationTriangle,
  FaVolumeUp,
  FaStop,
  FaEdit,
  FaLink,
  FaWhatsapp,
} from "react-icons/fa";
import BlockchainAuditModal from "./BlockchainAuditModal";
import WhatsAppAlertModal from "./WhatsAppAlertModal";

const Inventory = () => {
  const { t, currentLanguage, translate, speechLangCode } = useLanguage();
  const [form, setForm] = useState({
    tableName: "",
    tabletQty: "",
    amount: "",
    expiryDate: "",
  });
  const [inventory, setInventory] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedBlockchainItem, setSelectedBlockchainItem] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppType, setWhatsAppType] = useState("refill");
  const [whatsAppAlertData, setWhatsAppAlertData] = useState({});
  const [loading, setLoading] = useState(false);

  // FEFO sorting & filtering state
  const [filterMode, setFilterMode] = useState("fefo"); // 'all' | 'fefo' | 'expiringSoon' | 'expired'
  const [searchQuery, setSearchQuery] = useState("");

  // Smart Dispense Assistant State
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseForm, setDispenseForm] = useState({
    selectedMedicineName: "",
    courseDays: 30,
    dailyDose: 2,
    patientName: "",
  });
  const [dispenseLoading, setDispenseLoading] = useState(false);
  const [isModalSpeechActive, setIsModalSpeechActive] = useState(false);

  // OCR state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState("");
  const [scanSuccess, setScanSuccess] = useState("");
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

  // ✅ Medication OCR extraction using hybrid Tesseract.js / Gemini
  const handleScan = async () => {
    if (!imageFile) return;
    setIsScanning(true);
    setScanError("");
    setScanSuccess("");
    setScanProgress("Starting OCR...");

    try {
      const data = await performMedicationOCR(imageFile, (status) => {
        setScanProgress(status);
      });

      if (!data || (!data.name && !data.expiryDate)) {
        setScanError(
          "Could not detect tablet name or expiry date clearly. You can enter them manually below."
        );
        setIsScanning(false);
        setScanProgress("");
        return;
      }

      setForm((prev) => ({
        ...prev,
        tableName: data.name || prev.tableName,
        expiryDate: data.expiryDate || prev.expiryDate,
      }));
      setScanSuccess(`Details extracted via ${data.engine}! Check values below.`);
      toast.success("Details extracted successfully!");
    } catch (err) {
      console.error(err);
      setScanError("Failed to extract details. Please enter them manually below.");
    } finally {
      setIsScanning(false);
      setScanProgress("");
    }
  };

  // ✅ FEFO & Filtered Inventory calculation
  const processedInventory = useMemo(() => {
    let list = [...inventory];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((i) => (i.tableName || "").toLowerCase().includes(q));
    }

    const today = new Date();

    if (filterMode === "fefo") {
      // Sort strictly by Expiry Date ascending (earliest expiry first)
      list.sort(
        (a, b) =>
          new Date(a.expiryDate || "9999-12-31") - new Date(b.expiryDate || "9999-12-31")
      );
    } else if (filterMode === "expiringSoon") {
      list = list.filter((item) => {
        const expiry = new Date(item.expiryDate);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
      });
      list.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    } else if (filterMode === "expired") {
      list = list.filter((item) => new Date(item.expiryDate) < today);
    }

    return list;
  }, [inventory, filterMode, searchQuery]);

  // Distinct medicines for Smart Dispense selector
  const distinctMedicineNames = useMemo(() => {
    return Array.from(new Set(inventory.map((i) => i.tableName).filter(Boolean)));
  }, [inventory]);

  // Evaluate Smart Dispense recommendation in real-time
  const evaluateDispense = () => {
    if (!dispenseForm.selectedMedicineName) return null;

    const neededQty =
      Number(dispenseForm.courseDays || 0) * Number(dispenseForm.dailyDose || 1);
    const today = new Date();
    const courseEndDate = new Date();
    courseEndDate.setDate(today.getDate() + Number(dispenseForm.courseDays || 0));

    // Get matching batches sorted by FEFO (earliest expiry first)
    const matchingBatches = inventory
      .filter(
        (i) =>
          (i.tableName || "").toLowerCase() ===
            dispenseForm.selectedMedicineName.toLowerCase() &&
          Number(i.tabletQty) > 0
      )
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    if (matchingBatches.length === 0) {
      return {
        status: "OUT_OF_STOCK",
        neededQty,
        courseEndDate: courseEndDate.toISOString().split("T")[0],
        message: `No active stock found in inventory for ${dispenseForm.selectedMedicineName}.`,
      };
    }

    // Evaluate each batch for Zero-Risk compliance
    let recommendedBatch = null;
    let zeroRiskViolatedBatch = null;

    for (const batch of matchingBatches) {
      const batchExpiry = new Date(batch.expiryDate);
      if (batchExpiry < courseEndDate) {
        // This batch will expire before the patient finishes the prescribed course!
        if (!zeroRiskViolatedBatch) {
          zeroRiskViolatedBatch = batch;
        }
      } else {
        // Safe batch that lasts through the whole course
        if (!recommendedBatch && Number(batch.tabletQty) >= neededQty) {
          recommendedBatch = batch;
          break;
        } else if (!recommendedBatch) {
          recommendedBatch = batch;
        }
      }
    }

    const firstFefoBatch = matchingBatches[0];
    const isFirstBatchViolating = new Date(firstFefoBatch.expiryDate) < courseEndDate;

    return {
      status: recommendedBatch ? "APPROVED" : "ZERO_RISK_WARNING",
      neededQty,
      courseEndDate: courseEndDate.toISOString().split("T")[0],
      matchingBatches,
      recommendedBatch,
      zeroRiskViolatedBatch: isFirstBatchViolating ? firstFefoBatch : null,
      firstFefoBatch,
    };
  };

  const handleOpenDispenseModal = () => {
    const initialMed = distinctMedicineNames[0] || "";
    setDispenseForm({
      selectedMedicineName: initialMed,
      courseDays: 30,
      dailyDose: 2,
      patientName: "",
    });
    setShowDispenseModal(true);
  };

  const handleExecuteDispense = async (batchToDispense, qtyToDeduct) => {
    if (!batchToDispense) return;
    setDispenseLoading(true);

    try {
      const newQty = Math.max(0, Number(batchToDispense.tabletQty) - Number(qtyToDeduct));
      const updatedRecord = {
        ...batchToDispense,
        tabletQty: newQty,
      };

      await axios.put(`${baseUrl}/inventory/${batchToDispense.id}`, updatedRecord);
      toast.success(
        `Dispensed ${qtyToDeduct} units of ${batchToDispense.tableName}. Stock updated!`
      );
      let spokenText = `Zero risk dispense completed. Dispensed ${qtyToDeduct} units of ${batchToDispense.tableName}. Remaining stock is ${newQty}.`;
      if (currentLanguage !== "en") {
        spokenText = await translate(spokenText);
      }
      speakText(spokenText, { lang: speechLangCode });
      setShowDispenseModal(false);
      fetchInventory();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update inventory quantity during dispense!");
    } finally {
      setDispenseLoading(false);
    }
  };

  const activeDispenseEval = showDispenseModal ? evaluateDispense() : null;

  return (
    <div className="container py-4">
      <ToastContainer position="top-center" autoClose={2000} />

      {/* Header & Quick Action */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-primary mb-1">💊 Pharmacist FEFO Inventory & Dispensing</h3>
          <p className="text-muted small mb-0">
            Enterprise First-Expired, First-Out batch tracking with automated Zero-Risk Dispense Verification.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <LanguageSelector />
          <button
            className="btn btn-success fw-bold d-flex align-items-center gap-2 shadow-sm px-4 py-2"
            onClick={handleOpenDispenseModal}
          >
            <FaShieldAlt size={18} />
            Smart Dispense Assistant
          </button>
        </div>
      </div>

      {/* ✅ OCR Section */}
      <div className="card shadow-sm p-3 mb-4">
        <h5 className="mb-2 fw-semibold">📷 Extract Tablet Details via Multimodal OCR</h5>
        <p className="text-muted small">Upload or capture blister packaging for automated name & expiry extraction.</p>
        <div className="d-flex flex-column align-items-center">
          <input
            type="file"
            accept="image/*"
            className="form-control mb-3"
            style={{ maxWidth: "400px" }}
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
            {isScanning ? scanProgress || "Scanning..." : "Extract Details"}
          </button>
          {scanProgress && isScanning && (
            <div className="text-primary mt-2 small fw-semibold">⏳ {scanProgress}</div>
          )}
          {scanSuccess && (
            <div className="alert alert-success mt-2 py-1 px-3 small">✅ {scanSuccess}</div>
          )}
          {scanError && (
            <div className="alert alert-warning mt-2 py-1 px-3 small">⚠️ {scanError}</div>
          )}
        </div>
      </div>

      {/* ✅ Add/Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="border p-4 rounded bg-light shadow-sm mb-4"
      >
        <h5 className="fw-semibold mb-3">
          {editingId ? "✏️ Edit Inventory Batch" : "➕ Add New Medication Batch"}
        </h5>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Tablet Name</label>
            <input
              type="text"
              name="tableName"
              className="form-control"
              placeholder="e.g. Metformin 500mg"
              value={form.tableName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Batch Quantity</label>
            <input
              type="number"
              name="tabletQty"
              className="form-control"
              placeholder="Total units in batch"
              value={form.tabletQty}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              className="form-control"
              placeholder="Unit/Batch price"
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
            {loading ? "Saving..." : editingId ? "Update Record" : "Add Tablet"}
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

      {/* ✅ FEFO Filter Bar */}
      <div className="card shadow-sm p-3 mb-3 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="fw-semibold text-secondary small d-flex align-items-center gap-1">
              <FaSortAmountDown /> Dispense Mode:
            </span>
            <button
              className={`btn btn-sm ${
                filterMode === "fefo" ? "btn-primary fw-bold" : "btn-outline-secondary"
              }`}
              onClick={() => setFilterMode("fefo")}
            >
              ⚡ FEFO Priority (First Expired First Out)
            </button>
            <button
              className={`btn btn-sm ${
                filterMode === "all" ? "btn-primary fw-bold" : "btn-outline-secondary"
              }`}
              onClick={() => setFilterMode("all")}
            >
              All Batches
            </button>
            <button
              className={`btn btn-sm ${
                filterMode === "expiringSoon"
                  ? "btn-warning text-dark fw-bold"
                  : "btn-outline-warning text-dark"
              }`}
              onClick={() => setFilterMode("expiringSoon")}
            >
              ⏳ Expiring &le; 30 Days
            </button>
            <button
              className={`btn btn-sm ${
                filterMode === "expired" ? "btn-danger fw-bold" : "btn-outline-danger"
              }`}
              onClick={() => setFilterMode("expired")}
            >
              ⛔ Expired
            </button>
          </div>

          <div style={{ maxWidth: "260px", width: "100%" }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="🔍 Search tablet name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ✅ Enhanced Inventory Table */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table className="table table-hover table-striped align-middle text-center mb-0">
            <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>FEFO Rank</th>
                <th>{t("medicineName")}</th>
                <th>{t("quantity")}</th>
                <th>Batch Value (₹)</th>
                <th>{t("expiryDate")}</th>
                <th>Days Remaining</th>
                <th>{t("zeroRiskStatus")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {processedInventory.length > 0 ? (
                processedInventory.map((item, idx) => {
                  const today = new Date();
                  const expiry = new Date(item.expiryDate);
                  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

                  let statusBadge = <span className="badge bg-success">Safe</span>;
                  if (diffDays <= 0) {
                    statusBadge = <span className="badge bg-danger">Expired</span>;
                  } else if (diffDays <= 15) {
                    statusBadge = (
                      <span className="badge bg-danger">Expiring Soon ({diffDays}d)</span>
                    );
                  } else if (diffDays <= 45) {
                    statusBadge = (
                      <span className="badge bg-warning text-dark">Expiring in {diffDays}d</span>
                    );
                  }

                  const isNextFEFO = filterMode === "fefo" && idx === 0 && diffDays > 0;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        cursor: "pointer",
                        backgroundColor: isNextFEFO ? "#f0fdf4" : undefined,
                      }}
                    >
                      <td>
                        {isNextFEFO ? (
                          <span className="badge bg-success py-1 px-2">⚡ 1st to Dispense</span>
                        ) : (
                          <span className="badge bg-light text-dark border">#{idx + 1}</span>
                        )}
                      </td>
                      <td
                        className="fw-semibold text-start ps-3"
                        onClick={() => handleShowDetails(item)}
                      >
                        {item.tableName}
                      </td>
                      <td className="fw-bold">{item.tabletQty}</td>
                      <td>
                        {item.amount !== null && !isNaN(item.amount)
                          ? `₹${parseFloat(item.amount).toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="font-monospace">{item.expiryDate}</td>
                      <td>
                        <span
                          className={diffDays <= 30 ? "text-danger fw-bold" : "text-muted"}
                        >
                          {diffDays <= 0 ? "Expired" : `${diffDays} days`}
                        </span>
                      </td>
                      <td>{statusBadge}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-info"
                            title="View GS1 QR & Details"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowDetails(item);
                            }}
                          >
                            <FaQrcode />
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            title="Audit on Blockchain (Polygon PoS)"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBlockchainItem(item);
                            }}
                          >
                            <FaLink />
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-muted py-4">
                    No matching inventory batches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ SMART DISPENSE ASSISTANT MODAL */}
      {showDispenseModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FaShieldAlt /> Zero-Risk Smart Dispense Assistant
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDispenseModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Select Medicine</label>
                    <select
                      className="form-select"
                      value={dispenseForm.selectedMedicineName}
                      onChange={(e) =>
                        setDispenseForm({
                          ...dispenseForm,
                          selectedMedicineName: e.target.value,
                        })
                      }
                    >
                      {distinctMedicineNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-bold">Course Duration (Days)</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={dispenseForm.courseDays}
                      onChange={(e) =>
                        setDispenseForm({ ...dispenseForm, courseDays: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-bold">Daily Dose (Tablets/Day)</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={dispenseForm.dailyDose}
                      onChange={(e) =>
                        setDispenseForm({ ...dispenseForm, dailyDose: e.target.value })
                      }
                    />
                  </div>
                </div>

                {activeDispenseEval && (
                  <div>
                    <div className="p-3 bg-light rounded border mb-3">
                      <div className="row text-center">
                        <div className="col-4">
                          <small className="text-muted d-block">Tablets Required</small>
                          <span className="h4 fw-bold text-primary">
                            {activeDispenseEval.neededQty}
                          </span>
                        </div>
                        <div className="col-4">
                          <small className="text-muted d-block">Course Duration</small>
                          <span className="h4 fw-bold">{dispenseForm.courseDays} Days</span>
                        </div>
                        <div className="col-4">
                          <small className="text-muted d-block">Course End Date</small>
                          <span className="h4 fw-bold font-monospace">
                            {activeDispenseEval.courseEndDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Zero-Risk Analysis Result */}
                    {activeDispenseEval.zeroRiskViolatedBatch ? (
                      <div className="alert alert-danger border-danger d-flex align-items-start gap-3">
                        <FaExclamationTriangle
                          size={32}
                          className="text-danger flex-shrink-0 mt-1"
                        />
                        <div>
                          <h6 className="fw-bold mb-1">
                            🚨 ZERO-RISK DISPENSE VIOLATION DETECTED!
                          </h6>
                          <p className="small mb-1">
                            Earliest FEFO batch (Expiry:{" "}
                            <strong>
                              {activeDispenseEval.zeroRiskViolatedBatch.expiryDate}
                            </strong>
                            ) will expire <strong>before</strong> the patient completes
                            their course on{" "}
                            <strong>{activeDispenseEval.courseEndDate}</strong>!
                          </p>
                          <p className="small mb-0 text-muted">
                            Dispensing this batch violates Zero-Risk clinical dispensing
                            protocols.
                            {activeDispenseEval.recommendedBatch ? (
                              <span className="text-success fw-bold d-block mt-1">
                                ✅ System safely recommends Alternative Batch #
                                {activeDispenseEval.recommendedBatch.id} (Expiry:{" "}
                                {activeDispenseEval.recommendedBatch.expiryDate}, Stock:{" "}
                                {activeDispenseEval.recommendedBatch.tabletQty})
                              </span>
                            ) : (
                              <span className="text-danger fw-bold d-block mt-1">
                                ❌ No other batches found that remain valid for the full
                                course. Please re-order stock or dispense a shorter course.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ) : activeDispenseEval.recommendedBatch ? (
                      <div className="alert alert-success border-success d-flex align-items-start gap-3">
                        <FaCheckCircle
                          size={32}
                          className="text-success flex-shrink-0 mt-1"
                        />
                        <div>
                          <h6 className="fw-bold mb-1">
                            ✅ ZERO-RISK VERIFIED: SAFE TO DISPENSE
                          </h6>
                          <p className="small mb-0">
                            Recommended Batch:{" "}
                            <strong>
                              {activeDispenseEval.recommendedBatch.tableName}
                            </strong>{" "}
                            (Expires:{" "}
                            <strong>
                              {activeDispenseEval.recommendedBatch.expiryDate}
                            </strong>
                            ). Provides safe buffer beyond course completion on{" "}
                            <strong>{activeDispenseEval.courseEndDate}</strong>.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Action buttons */}
                    {activeDispenseEval.recommendedBatch && (
                      <div className="card border p-3 mt-3 bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="badge bg-primary me-2">
                              Selected Batch #{activeDispenseEval.recommendedBatch.id}
                            </span>
                            <strong>
                              Available Stock:{" "}
                              {activeDispenseEval.recommendedBatch.tabletQty}
                            </strong>
                          </div>
                          <button
                            className="btn btn-success fw-bold"
                            disabled={
                              dispenseLoading ||
                              Number(activeDispenseEval.recommendedBatch.tabletQty) <
                                activeDispenseEval.neededQty
                            }
                            onClick={() =>
                              handleExecuteDispense(
                                activeDispenseEval.recommendedBatch,
                                activeDispenseEval.neededQty
                              )
                            }
                          >
                            {dispenseLoading
                              ? "Updating Stock..."
                              : `Dispense ${activeDispenseEval.neededQty} Tablets & Deduct Stock`}
                          </button>
                        </div>
                        {Number(activeDispenseEval.recommendedBatch.tabletQty) <
                          activeDispenseEval.neededQty && (
                          <small className="text-danger mt-1">
                            ⚠️ Insufficient units in this batch (
                            {activeDispenseEval.recommendedBatch.tabletQty} &lt;{" "}
                            {activeDispenseEval.neededQty}).
                          </small>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDispenseModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal for Tablet Details with GS1 QR Code */}
      {selectedItem && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <FaQrcode /> Batch Details: {selectedItem.tableName}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body text-start">
                <div className="text-center mb-3">
                  {/* GS1 DataMatrix / QR Code representation */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=010890123456789017${(
                      selectedItem.expiryDate || ""
                    )
                      .replace(/-/g, "")
                      .slice(2)}10B${selectedItem.id}21${selectedItem.id}`}
                    alt="GS1 2D DataMatrix"
                    className="border p-2 rounded shadow-sm bg-white"
                  />
                  <div className="small text-muted font-monospace mt-1">
                    (01)08901234567890(17)
                    {(selectedItem.expiryDate || "").replace(/-/g, "").slice(2)}
                    (10)B{selectedItem.id}
                  </div>
                </div>

                <ul className="list-group list-group-flush small">
                  <li className="list-group-item d-flex justify-content-between">
                    <strong>Tablet Name:</strong> <span>{selectedItem.tableName}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <strong>Batch ID:</strong> <span>BATCH-{selectedItem.id}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <strong>Stock Available:</strong>{" "}
                    <span className="fw-bold">{selectedItem.tabletQty} units</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <strong>Amount (₹):</strong>{" "}
                    <span>
                      {selectedItem.amount !== null && !isNaN(selectedItem.amount)
                        ? `₹${parseFloat(selectedItem.amount).toFixed(2)}`
                        : "—"}
                    </span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <strong>Expiry Date:</strong>{" "}
                    <span className="fw-bold text-danger font-monospace">
                      {selectedItem.expiryDate}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button
                  className={`btn btn-sm d-flex align-items-center gap-1 ${
                    isModalSpeechActive ? "btn-danger" : "btn-outline-primary"
                  }`}
                  onClick={async () => {
                    const speechKey = `inventory-batch-${selectedItem.id}`;
                    let text = `Medicine ${selectedItem.tableName}. Batch ID ${selectedItem.id}. Stock: ${selectedItem.tabletQty} units. Expiration date: ${selectedItem.expiryDate}.`;
                    if (currentLanguage !== "en") {
                      text = await translate(text);
                    }
                    const isPlaying = toggleSpeech(speechKey, text, {
                      lang: speechLangCode,
                      onStart: () => setIsModalSpeechActive(true),
                      onEnd: () => setIsModalSpeechActive(false),
                      onStop: () => setIsModalSpeechActive(false),
                      onError: () => setIsModalSpeechActive(false),
                    });

                    if (isPlaying) {
                      toast.info(`🔊 Reading batch details for ${selectedItem.tableName}... (Click again to stop)`, { autoClose: 2500 });
                      setIsModalSpeechActive(true);
                    } else {
                      toast.info(`⏹️ Stopped voice readout.`, { autoClose: 1500 });
                      setIsModalSpeechActive(false);
                    }
                  }}
                >
                  {isModalSpeechActive ? <FaStop /> : <FaVolumeUp />}
                  <span>{isModalSpeechActive ? "Stop Voice" : "Voice Readout"}</span>
                </button>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success fw-bold btn-sm d-flex align-items-center gap-1"
                    onClick={() => {
                      setWhatsAppAlertData({
                        medicineName: selectedItem.tableName,
                        remainingQty: selectedItem.tabletQty,
                        expiryDate: selectedItem.expiryDate,
                        daysLeft: 14,
                      });
                      setWhatsAppType("refill");
                      setShowWhatsAppModal(true);
                    }}
                    title="Send batch advice to patient via WhatsApp"
                  >
                    <FaWhatsapp size={14} /> WhatsApp
                  </button>
                  <button
                    className="btn btn-warning fw-bold btn-sm"
                    onClick={() => {
                      handleEdit(selectedItem);
                      handleCloseModal();
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔗 Blockchain Provenance Audit Modal */}
      <BlockchainAuditModal
        show={!!selectedBlockchainItem}
        onClose={() => setSelectedBlockchainItem(null)}
        item={selectedBlockchainItem}
      />

      {/* 📲 WhatsApp & SMS Alert Modal */}
      <WhatsAppAlertModal
        show={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        initialType={whatsAppType}
        alertData={whatsAppAlertData}
        patientName="Valued Customer"
      />
    </div>
  );
};

export default Inventory;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaPlusCircle, FaTrash, FaShieldAlt, FaVolumeUp, FaStop, FaNotesMedical, FaLink, FaWhatsapp, FaShoppingCart, FaBell, FaHeartbeat, FaChevronDown, FaChevronUp, FaBrain } from "react-icons/fa";
import { toast } from "react-toastify";
import { baseUrl } from "../App";
import { performMedicationOCR } from "../utils/ocrScanner";
import { calculateMedicationRisk, getZeroRiskSummary } from "../utils/predictiveRiskCalculator";
import { analyzeClinicalSafety } from "../utils/clinicalSafetyChecker";
import { toggleSpeech } from "../utils/voiceAssistant";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import PrescriptionScannerModal from "./PrescriptionScannerModal";
import BlockchainAuditModal from "./BlockchainAuditModal";
import WhatsAppAlertModal from "./WhatsAppAlertModal";
import DirectPharmacyModal from "./DirectPharmacyModal";
import AISettingsModal from "./AISettingsModal";

const ManageMedication = () => {
  const { t, currentLanguage, translate, speechLangCode } = useLanguage();
  const [medications, setMedications] = useState([]);
  const [form, setForm] = useState({
    tableName: "",
    tabletQty: "",
    timing: ["Morning"],
    doctor: "",
    expiryDate: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState("");
  const [scanSuccess, setScanSuccess] = useState("");
  const [scanError, setScanError] = useState("");

  const [safetyData, setSafetyData] = useState(null);
  const [isAnalyzingSafety, setIsAnalyzingSafety] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [activeSpeechMid, setActiveSpeechMid] = useState(null);
  const [isModalSpeechActive, setIsModalSpeechActive] = useState(false);

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedBlockchainItem, setSelectedBlockchainItem] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppType, setWhatsAppType] = useState("schedule");
  const [showAISettings, setShowAISettings] = useState(false);
  const [whatsAppAlertData, setWhatsAppAlertData] = useState({});

  const [showDirectPharmacyModal, setShowDirectPharmacyModal] = useState(false);
  const [selectedPharmacyItem, setSelectedPharmacyItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleTestAlarm = () => {
    const sampleMed = medications[0] || {
      tableName: "Metformin 500mg (Daily Dose)",
      doctor: "Dr. Sharma (Cardio-Diabetologist)",
    };
    window.dispatchEvent(
      new CustomEvent("testMedicationAlarm", {
        detail: {
          tableName: sampleMed.tableName,
          doctor: sampleMed.doctor,
        },
      })
    );
    toast.info("🚨 9:00 AM Alarm sounding! Look at the top of your screen to Turn Off or Mark as Taken.", {
      autoClose: 3500,
      position: "top-center",
    });
  };

  const [editingId, setEditingId] = useState(null);
  const patientId = sessionStorage.getItem("pid");
  const role = sessionStorage.getItem("role"); // 🔹 Get user role

  useEffect(() => {
    if (patientId) fetchMedications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const fetchMedications = async () => {
    try {
      const res = await axios.get(`${baseUrl}/medications/get/patient/${patientId}`);
      setMedications(res.data);
    } catch (err) {
      console.error("Error fetching medications:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimingChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      let updatedTimings = [...prev.timing];
      if (checked) updatedTimings.push(value);
      else updatedTimings = updatedTimings.filter((t) => t !== value);
      return { ...prev, timing: updatedTimings };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      alert("Patient not found in session.");
      return;
    }

    const payload = {
      ...form,
      timing: form.timing.join(", "),
      tabletConsumed: 0,
    };

    try {
      await axios.post(`${baseUrl}/medications/add/${patientId}`, payload);
      alert("Medication added successfully!");
      resetForm();
      fetchMedications();
    } catch (err) {
      console.error("Error adding medication:", err);
    }
  };

  const handleEdit = (med) => {
    setEditingId(med.mid);
    setForm({
      tableName: med.tableName,
      tabletQty: med.tabletQty,
      timing: med.timing.split(",").map((t) => t.trim()),
      doctor: med.doctor || "",
      expiryDate: med.expiryDate || "",
    });
    setShowAddForm(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        ...form,
        timing: form.timing.join(", "),
      };
      await axios.put(`${baseUrl}/medications/update/${editingId}`, payload);
      alert("Medication updated successfully!");
      resetForm();
      fetchMedications();
    } catch (err) {
      console.error("Error updating medication:", err);
    }
  };

  const handleDelete = async (mid) => {
    if (window.confirm("Are you sure you want to delete this medication?")) {
      try {
        await axios.delete(`${baseUrl}/medications/delete/${mid}`);
        alert("Medication deleted successfully!");
        fetchMedications();
      } catch (err) {
        console.error("Error deleting medication:", err);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      tableName: "",
      tabletQty: "",
      timing: ["Morning"],
      doctor: "",
      expiryDate: "",
    });
    setShowAddForm(false);
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
      setScanError("Could not detect tablet name or expiry date clearly. You can enter them manually below.");
      setIsScanning(false);
      setScanProgress("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      tableName: data.name || prev.tableName,
      expiryDate: data.expiryDate || prev.expiryDate,
    }));
    setShowAddForm(true);

    setScanSuccess(`Details extracted via ${data.engine}! Check the values below.`);
  } catch (err) {
    console.error("Scan error:", err);
    setScanError("Failed to extract details. Please enter them manually below.");
  } finally {
    setIsScanning(false);
    setScanProgress("");
  }
};




  return (
    <div className="container mt-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <h3 className="mb-0 fw-bold text-primary">💊 {t("manageMedication")}</h3>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-success d-flex align-items-center gap-2 shadow-sm"
            onClick={() => {
              setWhatsAppType("schedule");
              setWhatsAppAlertData({ medications });
              setShowWhatsAppModal(true);
            }}
            title="Send full medication regimen to WhatsApp"
          >
            <FaWhatsapp />
            <span>{t("whatsAppAlerts") || "WhatsApp Schedule"}</span>
          </button>
          {role !== "patient" && (
            <button
              className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
              onClick={() => setShowPrescriptionModal(true)}
              title="Upload handwritten doctor prescription to auto-extract and add medications"
            >
              <FaNotesMedical />
              <span>{t("scanDoctorPrescription")}</span>
            </button>
          )}
          <LanguageSelector />
        </div>
      </div>

      {/* OCR Section */}
<div className="card shadow-sm p-3 mb-4">
  <div className="d-flex justify-content-between align-items-center mb-3">
    <h5 className="mb-0">{t("extractMedicationDetails")}</h5>
    <button
      type="button"
      className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 shadow-sm"
      style={{ borderRadius: "8px", fontSize: "12px", fontWeight: 600 }}
      onClick={() => setShowAISettings(true)}
      title="Configure Cloud Gemini Vision or Offline OCR"
    >
      <FaBrain size={12} style={{ color: "#06B6D4" }} />
      <span>AI Vision Settings</span>
    </button>
  </div>

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
      disabled={role === "patient"}
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
          {t("removeImage")}
        </button>
      </>
    )}
    <button
      type="button"
      className="btn btn-outline-primary mt-3"
      onClick={handleScan}
      disabled={!imageFile || isScanning || role === "patient"}
    >
      {isScanning ? (scanProgress || t("scanning")) : t("extractDetails")}
    </button>

    {scanProgress && isScanning && (
      <div className="text-primary mt-2 small fw-semibold">
        ⏳ {scanProgress}
      </div>
    )}
    {scanSuccess && (
      <div className="alert alert-success mt-2 py-1 px-3 small">
        ✅ {scanSuccess}
      </div>
    )}
    {scanError && (
      <div className="alert alert-warning mt-2 py-1 px-3 small">
        ⚠️ {scanError}
      </div>
    )}
  </div>
</div>

      {/* 📊 Zero-Risk Dispensing Analytics Header */}
      {medications.length > 0 && (() => {
        const summary = getZeroRiskSummary(medications);
        return (
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm border-0 border-start border-primary border-4 p-3 bg-light">
                <span className="text-muted small fw-bold">{t("totalMedications")}</span>
                <h4 className="fw-bold mb-0 text-primary">{summary.total}</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 border-start border-success border-4 p-3 bg-light">
                <span className="text-muted small fw-bold">{t("zeroRiskVerified")}</span>
                <h4 className="fw-bold mb-0 text-success">{summary.safe}</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 border-start border-danger border-4 p-3 bg-light">
                <span className="text-muted small fw-bold">{t("overrunsExpiry")}</span>
                <h4 className="fw-bold mb-0 text-danger">{summary.violations}</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 border-start border-warning border-4 p-3 bg-light">
                <span className="text-muted small fw-bold">{t("tightBuffer")}</span>
                <h4 className="fw-bold mb-0 text-warning">{summary.tightBuffers}</h4>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 🔬 AI Clinical Safety Audit Trigger */}
      {medications.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-3 shadow-sm border">
          <div>
            <h6 className="fw-bold mb-1 text-dark">
              🔬 {t("ddiCheckerTitle")}
            </h6>
            <p className="mb-0 small text-muted">
              {t("ddiCheckerDesc")}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-primary fw-bold text-nowrap d-flex align-items-center gap-2"
            onClick={async () => {
              setIsAnalyzingSafety(true);
              try {
                const res = await analyzeClinicalSafety(medications);
                setSafetyData(res);
                setShowSafetyModal(true);
              } catch (err) {
                console.error("Clinical audit error:", err);
              } finally {
                setIsAnalyzingSafety(false);
              }
            }}
            disabled={isAnalyzingSafety}
          >
            <FaShieldAlt /> {isAnalyzingSafety ? t("auditingRegimen") : t("auditDrugInteractions")}
          </button>
        </div>
      )}

      {/* ➕ Collapsible Add / Edit Medication Form */}
      <div className="card shadow-sm mb-4 border-0 rounded-3 overflow-hidden" style={{ transition: "all 0.3s ease" }}>
        <div
          className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center cursor-pointer border-0"
          style={{ cursor: "pointer", background: showAddForm ? "#f8fafc" : "#ffffff" }}
          onClick={() => setShowAddForm((prev) => !prev)}
          role="button"
          tabIndex={0}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className={`p-2 rounded-circle d-flex align-items-center justify-content-center ${
                showAddForm ? "bg-primary text-white" : "bg-light text-primary"
              }`}
              style={{ width: "38px", height: "38px" }}
            >
              {editingId ? <FaEdit size={16} /> : <FaPlusCircle size={16} />}
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-dark">
                {editingId ? `✏️ ${t("editMedication")}` : `➕ ${t("addNewMedication")}`}
              </h5>
              <small className="text-muted d-block">
                {showAddForm
                  ? "Form active — auto-filled on scan / edit or enter manually"
                  : "Collapsed by default — auto-opens on medicine scan or edit (click to toggle)"}
              </small>
            </div>
          </div>
          <button
            type="button"
            className={`btn btn-sm ${showAddForm ? "btn-outline-secondary" : "btn-primary"} d-flex align-items-center gap-2 rounded-pill px-3 shadow-sm`}
            onClick={(e) => {
              e.stopPropagation();
              setShowAddForm((prev) => !prev);
            }}
          >
            {showAddForm ? (
              <>
                <FaChevronUp size={12} /> <span>{t("collapse") || "Collapse Form"}</span>
              </>
            ) : (
              <>
                <FaChevronDown size={12} /> <span>{t("fillManually") || "➕ Add / Fill Manually"}</span>
              </>
            )}
          </button>
        </div>

        {showAddForm && (
          <div className="card-body p-4 pt-2 border-top bg-light bg-opacity-50">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-4">
                <label className="form-label">{t("tabletName")}</label>
                <input
                  type="text"
                  name="tableName"
                  className="form-control"
                  value={form.tableName}
                  onChange={handleInputChange}
                  required
                  disabled={role === "patient"}
                  placeholder="e.g. Paracetamol 500mg"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">{t("expiryDate")}</label>
                <input
                  type="date"
                  name="expiryDate"
                  className="form-control"
                  value={form.expiryDate}
                  onChange={handleInputChange}
                  required
                  disabled={role === "patient"}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">{t("tabletQuantity")}</label>
                <input
                  type="number"
                  name="tabletQty"
                  className="form-control"
                  value={form.tabletQty}
                  onChange={handleInputChange}
                  required
                  disabled={role === "patient"}
                  placeholder="e.g. 30"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">{t("doctor")}</label>
                <input
                  type="text"
                  name="doctor"
                  className="form-control"
                  value={form.doctor}
                  onChange={handleInputChange}
                  required
                  disabled={role === "patient"}
                  placeholder="e.g. Dr. Sharma"
                />
              </div>

              <div className="col-12">
                <label className="form-label d-block">{t("timing")}</label>
                {["Morning", "Afternoon", "Evening"].map((time) => (
                  <div className="form-check form-check-inline" key={time}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={time}
                      checked={form.timing.includes(time)}
                      onChange={handleTimingChange}
                      disabled={role === "patient"}
                    />
                    <label className="form-check-label">{t(time.toLowerCase())}</label>
                  </div>
                ))}
              </div>

              {/* ⚡ Live Predictive Expiry & Zero-Risk Calculator Card */}
              {form.tabletQty && form.expiryDate && (() => {
                const live = calculateMedicationRisk({
                  tabletQty: form.tabletQty,
                  timing: form.timing,
                  expiryDate: form.expiryDate,
                });

                return (
                  <div className={`col-12 p-3 rounded-3 border border-2 border-${live.badgeColor} bg-white shadow-sm mt-3`}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-dark">
                        🛡️ {t("zeroRiskPredictiveAnalysis")}:
                      </span>
                      <span className={`badge bg-${live.badgeColor} px-3 py-2 text-uppercase`}>
                        {live.badgeText}
                      </span>
                    </div>
                    <div className="row g-2 small text-secondary">
                      <div className="col-md-3">
                        <strong>{t("dailyIntake")}:</strong> {live.dailyDoses} dose(s)/day
                      </div>
                      <div className="col-md-3">
                        <strong>{t("courseDuration")}:</strong> {live.daysSupply} days
                      </div>
                      <div className="col-md-3">
                        <strong>{t("projectedRunout")}:</strong> <span className="text-dark fw-bold">{live.runoutDateStr}</span>
                      </div>
                      <div className="col-md-3">
                        <strong>{t("safetyBuffer")}:</strong>{" "}
                        <span className={live.bufferDays < 0 ? "text-danger fw-bold" : "text-success fw-bold"}>
                          {live.bufferDays >= 0 ? `+${live.bufferDays} ${t("daysSafe")}` : `${live.bufferDays} ${t("daysOverrun")}`}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-dark small">
                      {live.message}
                    </div>
                    {live.recommendation && (
                      <div className="mt-1 small fw-semibold text-primary">
                        💡 <strong>{t("action")}:</strong> {live.recommendation}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="col-12 text-center mt-3 d-flex justify-content-center gap-2">
                {editingId ? (
                  <button
                    type="button"
                    className="btn btn-success px-4"
                    onClick={handleUpdate}
                    disabled={role === "patient"}
                  >
                    <FaSave className="me-2" /> {t("updateMedication")}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={role === "patient"}
                  >
                    <FaPlusCircle className="me-2" /> {t("addMedication")}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3"
                  onClick={() => resetForm()}
                >
                  {t("cancel") || "Cancel / Collapse"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 🚀 CLINICAL ACTIONS & CHRONIC CARE HUB */}
      <div className="p-3 mb-4 rounded-4 shadow-sm border bg-white d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-danger rounded-pill p-2"><FaBell /></span>
          <div>
            <div className="fw-bold small" style={{ color: "#0F2942" }}>Timed Medication Alarm & Direct Refills</div>
            <div className="small font-mono text-muted" style={{ fontSize: "11px" }}>
              Stipulated dose alarm (1-min chime) • Compare retail pharmacy prices
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {/* Only patients/caretakers can test their own alarm */}
          {role !== "PHARMASURE" && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1.5 rounded-pill px-3 py-1.5 fw-semibold"
              onClick={handleTestAlarm}
              title="Simulate 9:00 AM alarm with continuous audio chime"
            >
              <FaBell /> <span>🔔 Test 9:00 AM Alarm</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-sm btn-success d-flex align-items-center gap-1.5 rounded-pill px-3 py-1.5 fw-semibold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #0D9488 0%, #059669 100%)", border: "none" }}
            onClick={() => {
              setSelectedPharmacyItem(medications[0] || null);
              setShowDirectPharmacyModal(true);
            }}
          >
            <FaHeartbeat /> <span>🏥 ChronicCare 365 & Direct Store (Save ₹100+)</span>
          </button>
        </div>
      </div>

      {/* 🖥️ Desktop Medication Table (screens >= 992px) */}
      <div className="d-none d-lg-block card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 medication-table">
            <thead style={{ backgroundColor: "#0F2942" }}>
              <tr style={{ backgroundColor: "#0F2942" }}>
                <th className="py-3 px-3 text-white" style={{ backgroundColor: "#0F2942", color: "#ffffff", borderBottom: "2px solid #06B6D4" }}>{t("medicineName")}</th>
                <th className="py-3 text-white" style={{ backgroundColor: "#0F2942", color: "#ffffff", borderBottom: "2px solid #06B6D4" }}>{t("quantity")}</th>
                <th className="py-3 text-white" style={{ backgroundColor: "#0F2942", color: "#ffffff", borderBottom: "2px solid #06B6D4" }}>{t("doctor")}</th>
                <th className="py-3 text-white" style={{ backgroundColor: "#0F2942", color: "#ffffff", borderBottom: "2px solid #06B6D4" }}>{t("timing")}</th>
                <th className="py-3 text-white" style={{ backgroundColor: "#0F2942", color: "#ffffff", borderBottom: "2px solid #06B6D4" }}>{t("expiryDate")}</th>
                <th className="py-3 text-white" style={{ backgroundColor: "#0F2942", color: "#ffffff", borderBottom: "2px solid #06B6D4" }}>{t("projectedRunout")}</th>
                <th className="py-3 text-white" style={{ backgroundColor: "#0F2942", color: "#ffffff", borderBottom: "2px solid #06B6D4" }}>{t("zeroRiskStatus")}</th>
                <th className="py-3 text-white" style={{ backgroundColor: "#0F2942", color: "#ffffff", borderBottom: "2px solid #06B6D4" }}>{t("verifyBlockchain") || "Blockchain Audit"}</th>
                <th className="py-3 text-white" style={{ backgroundColor: "#0F2942", color: "#ffffff", borderBottom: "2px solid #06B6D4" }}>Direct Pharmacy</th>
                {role !== "patient" && <th className="py-3 text-white" style={{ backgroundColor: "#0F2942", color: "#ffffff", borderBottom: "2px solid #06B6D4" }}>{t("actions")}</th>}
              </tr>
            </thead>
            <tbody>
              {medications.length > 0 ? (
                medications.map((med) => {
                  const risk = calculateMedicationRisk(med);
                  const rowClass = risk.status === "RUNOUT_EXCEEDS_EXPIRY" 
                    ? "table-danger" 
                    : risk.status === "TIGHT_BUFFER" 
                    ? "table-warning" 
                    : "";

                  return (
                    <tr key={med.mid} className={rowClass}>
                      <td className="fw-semibold">
                        <div className="d-flex align-items-center">
                          <button
                            type="button"
                            className={`btn btn-sm p-1 me-2 rounded-circle d-flex align-items-center justify-content-center ${
                              activeSpeechMid === med.mid
                                ? "btn-danger text-white border-0 shadow-sm"
                                : "btn-outline-primary"
                            }`}
                            style={{ width: "26px", height: "26px", minWidth: "26px" }}
                            title={activeSpeechMid === med.mid ? "Click to stop voice readout" : "Listen to dose schedule"}
                            onClick={async () => {
                              const speechKey = `med-${med.mid}`;
                              let text = `Medication: ${med.tableName}. Take during ${med.timing}. Remaining quantity is ${med.tabletQty} tablets. Expiry date is ${med.expiryDate}. Status: ${risk.badgeText}. ${risk.message}`;
                              if (currentLanguage !== "en") {
                                text = await translate(text);
                              }
                              const isPlaying = toggleSpeech(speechKey, text, {
                                lang: speechLangCode,
                                onStart: () => setActiveSpeechMid(med.mid),
                                onEnd: () => setActiveSpeechMid(null),
                                onStop: () => setActiveSpeechMid(null),
                                onError: () => setActiveSpeechMid(null),
                              });

                              if (isPlaying) {
                                toast.info(`🔊 Reading: ${med.tableName} (Click again to stop)`, { autoClose: 2000 });
                                setActiveSpeechMid(med.mid);
                              } else {
                                toast.info(`⏹️ Stopped voice for ${med.tableName}`, { autoClose: 1500 });
                                setActiveSpeechMid(null);
                              }
                            }}
                          >
                            {activeSpeechMid === med.mid ? <FaStop size={10} /> : <FaVolumeUp size={11} />}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success p-1 me-2 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "26px", height: "26px", minWidth: "26px" }}
                            title="Send alert/reminder for this medicine via WhatsApp"
                            onClick={() => {
                              const isExpiryIssue = risk.status === "RUNOUT_EXCEEDS_EXPIRY";
                              setWhatsAppType(isExpiryIssue ? "zeroRisk" : "refill");
                              setWhatsAppAlertData({
                                medicineName: med.tableName,
                                runoutDateStr: risk.runoutDateStr,
                                expiryDate: med.expiryDate,
                                daysDifference: risk.daysDifference,
                                remainingQty: med.tabletQty,
                              });
                              setShowWhatsAppModal(true);
                            }}
                          >
                            <FaWhatsapp size={12} />
                          </button>
                          <span>{med.tableName}</span>
                        </div>
                      </td>
                      <td>{med.tabletQty} tabs</td>
                      <td>{med.doctor}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {med.timing.split(",").map((t, i) => (
                            <span
                              key={i}
                              className="badge"
                              style={{
                                background: "rgba(6,182,212,0.12)",
                                border: "1px solid rgba(6,182,212,0.3)",
                                color: "#0891B2",
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "3px 8px",
                                borderRadius: "20px",
                              }}
                            >
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="text-nowrap">{med.expiryDate}</td>
                      <td className="text-nowrap fw-semibold">{risk.runoutDateStr}</td>
                      <td>
                        <span className={`badge bg-${risk.badgeColor} d-inline-block mb-1`}>
                          {risk.badgeText}
                        </span>
                        <div className="small text-muted" style={{ fontSize: "11px", maxWidth: "240px" }}>
                          {risk.message}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1 shadow-sm px-2 py-1"
                          style={{ fontSize: "11px", borderRadius: "20px" }}
                          onClick={() => setSelectedBlockchainItem(med)}
                          title="Audit batch integrity on Polygon PoS"
                        >
                          <FaLink size={10} className="text-primary" />
                          <span className="fw-bold text-dark">Verified</span>
                          <span className="badge bg-success rounded-pill" style={{ fontSize: "8px" }}>PoS</span>
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 shadow-sm px-2.5 py-1"
                          style={{ fontSize: "11px", borderRadius: "20px" }}
                          onClick={() => {
                            setSelectedPharmacyItem(med);
                            setShowDirectPharmacyModal(true);
                          }}
                          title="Compare retail store prices and order direct"
                        >
                          <FaShoppingCart size={10} />
                          <span className="fw-bold">Buy Direct</span>
                          <span className="badge bg-danger rounded-pill" style={{ fontSize: "8px" }}>-8%</span>
                        </button>
                      </td>
                      {role !== "patient" && (
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleEdit(med)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(med.mid)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={role === "patient" ? 9 : 10} className="text-center text-muted py-4">
                    No medications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📱 Mobile Medication Cards View (screens < 992px) */}
      <div className="d-block d-lg-none mb-4">
        {medications.length > 0 ? (
          medications.map((med) => {
            const risk = calculateMedicationRisk(med);
            const borderAccent = risk.status === "RUNOUT_EXCEEDS_EXPIRY"
              ? "#EF4444"
              : risk.status === "TIGHT_BUFFER"
              ? "#F59E0B"
              : "#10B981";
            const bgAccent = risk.status === "RUNOUT_EXCEEDS_EXPIRY"
              ? "rgba(239, 68, 68, 0.04)"
              : risk.status === "TIGHT_BUFFER"
              ? "rgba(245, 158, 11, 0.04)"
              : "#FFFFFF";

            return (
              <div
                key={med.mid}
                className="card border-0 shadow-sm rounded-4 mb-3 p-3 position-relative"
                style={{
                  borderLeft: `5px solid ${borderAccent}`,
                  backgroundColor: bgAccent,
                }}
              >
                {/* Header: Title + Doctor + Risk Badge */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: "#0F2942", fontSize: "16px" }}>
                      {med.tableName}
                    </h6>
                    <div className="text-muted small" style={{ fontSize: "12px" }}>
                      👨‍⚕️ {med.doctor || "Consulting Physician"}
                    </div>
                  </div>
                  <span
                    className={`badge bg-${risk.badgeColor} py-1.5 px-2.5 rounded-pill shadow-sm`}
                    style={{ fontSize: "11px" }}
                  >
                    {risk.badgeText}
                  </span>
                </div>

                {/* Quick Audio & WhatsApp Alert Buttons */}
                <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                  <button
                    type="button"
                    className={`btn btn-sm d-inline-flex align-items-center gap-1.5 rounded-pill px-2.5 py-1 ${
                      activeSpeechMid === med.mid ? "btn-danger text-white shadow-sm" : "btn-outline-primary"
                    }`}
                    style={{ fontSize: "12px", fontWeight: 500 }}
                    onClick={async () => {
                      const speechKey = `med-${med.mid}`;
                      let text = `Medication: ${med.tableName}. Take during ${med.timing}. Remaining quantity is ${med.tabletQty} tablets. Expiry date is ${med.expiryDate}. Status: ${risk.badgeText}. ${risk.message}`;
                      if (currentLanguage !== "en") {
                        text = await translate(text);
                      }
                      const isPlaying = toggleSpeech(speechKey, text, {
                        lang: speechLangCode,
                        onStart: () => setActiveSpeechMid(med.mid),
                        onEnd: () => setActiveSpeechMid(null),
                        onStop: () => setActiveSpeechMid(null),
                        onError: () => setActiveSpeechMid(null),
                      });
                      if (isPlaying) {
                        toast.info(`🔊 Reading: ${med.tableName}`, { autoClose: 2000 });
                        setActiveSpeechMid(med.mid);
                      } else {
                        setActiveSpeechMid(null);
                      }
                    }}
                  >
                    {activeSpeechMid === med.mid ? <FaStop size={10} /> : <FaVolumeUp size={11} />}
                    <span>{activeSpeechMid === med.mid ? "Stop Voice" : "Listen"}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1.5 rounded-pill px-2.5 py-1"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                    onClick={() => {
                      const isExpiryIssue = risk.status === "RUNOUT_EXCEEDS_EXPIRY";
                      setWhatsAppType(isExpiryIssue ? "zeroRisk" : "refill");
                      setWhatsAppAlertData({
                        medicineName: med.tableName,
                        runoutDateStr: risk.runoutDateStr,
                        expiryDate: med.expiryDate,
                        daysDifference: risk.daysDifference,
                        remainingQty: med.tabletQty,
                      });
                      setShowWhatsAppModal(true);
                    }}
                  >
                    <FaWhatsapp size={12} />
                    <span>WhatsApp Alert</span>
                  </button>
                </div>

                {/* Key Metrics Grid */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="p-2 rounded-3 h-100" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <span className="text-muted d-block" style={{ fontSize: "11px" }}>Quantity Left</span>
                      <strong style={{ color: "#0F2942", fontSize: "13px" }}>📦 {med.tabletQty} tabs</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded-3 h-100" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <span className="text-muted d-block" style={{ fontSize: "11px" }}>Timing</span>
                      <div className="d-flex flex-wrap gap-1 mt-0.5">
                        {med.timing.split(",").map((t, i) => (
                          <span
                            key={i}
                            className="badge"
                            style={{
                              background: "rgba(6,182,212,0.12)",
                              border: "1px solid rgba(6,182,212,0.3)",
                              color: "#0891B2",
                              fontSize: "10px",
                              padding: "2px 6px",
                            }}
                          >
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded-3 h-100" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <span className="text-muted d-block" style={{ fontSize: "11px" }}>Expiry Date</span>
                      <strong style={{ color: risk.daysDifference <= 15 ? "#DC2626" : "#0F2942", fontSize: "13px" }}>
                        📅 {med.expiryDate}
                      </strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded-3 h-100" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <span className="text-muted d-block" style={{ fontSize: "11px" }}>Projected Runout</span>
                      <strong style={{ color: "#0F2942", fontSize: "13px" }}>⏳ {risk.runoutDateStr}</strong>
                    </div>
                  </div>
                </div>

                {/* Risk Warning Message (if applicable) */}
                {risk.status !== "SAFE_TO_DISPENSE" && (
                  <div
                    className={`alert alert-${risk.status === "RUNOUT_EXCEEDS_EXPIRY" ? "danger" : "warning"} py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2`}
                    style={{ fontSize: "12px" }}
                  >
                    <FaShieldAlt size={14} className="flex-shrink-0" />
                    <span>{risk.message}</span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top">
                  <div className="d-flex flex-wrap align-items-center gap-1.5">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1 rounded-pill px-2.5 py-1"
                      style={{ fontSize: "11px" }}
                      onClick={() => setSelectedBlockchainItem(med)}
                    >
                      <FaLink size={9} />
                      <span className="fw-semibold">Blockchain Audit</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 rounded-pill px-2.5 py-1"
                      style={{ fontSize: "11px" }}
                      onClick={() => {
                        setSelectedPharmacyItem(med);
                        setShowDirectPharmacyModal(true);
                      }}
                    >
                      <FaShoppingCart size={9} />
                      <span className="fw-semibold">Buy Direct</span>
                      <span className="badge bg-danger rounded-pill" style={{ fontSize: "8px" }}>-8%</span>
                    </button>
                  </div>

                  {role !== "patient" && (
                    <div className="d-flex align-items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(med)}
                        title="Edit"
                        style={{ padding: "4px 8px" }}
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(med.mid)}
                        title="Delete"
                        style={{ padding: "4px 8px" }}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-muted mb-3">
            No medications found.
          </div>
        )}
      </div>

      {/* 🔬 AI Clinical Interaction Modal */}
      {showSafetyModal && safetyData && (
        <div
          className="modal show fade"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className={`modal-header ${safetyData.overallStatus === "SAFE" ? "bg-success" : "bg-warning text-dark"} text-white py-3`}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FaShieldAlt /> {t("clinicalAuditReport")}
                </h5>
                <button
                  type="button"
                  className={`btn-close ${safetyData.overallStatus === "SAFE" ? "btn-close-white" : ""}`}
                  onClick={() => setShowSafetyModal(false)}
                />
              </div>

              <div className="modal-body p-4">
                <div className="d-flex justify-content-between align-items-center p-3 mb-3 bg-light rounded-3 border">
                  <div>
                    <span className="text-muted small fw-bold">{t("safetyScore")}</span>
                    <h3 className="fw-bold mb-0 text-dark">
                      {safetyData.safetyScore} <span className="fs-6 text-muted">/ 100</span>
                    </h3>
                  </div>
                  <span className={`badge ${safetyData.overallStatus === "SAFE" ? "bg-success" : "bg-warning text-dark"} fs-6 px-3 py-2 text-uppercase`}>
                    {safetyData.overallStatus}
                  </span>
                </div>

                <p className="fw-semibold text-secondary mb-3">
                  {safetyData.summary}
                </p>

                {/* Drug-Drug Interactions */}
                <h6 className="fw-bold text-dark mt-4 mb-2">⚡ Potential Drug Interactions:</h6>
                {safetyData.interactions && safetyData.interactions.length > 0 ? (
                  <div className="d-flex flex-column gap-2 mb-3">
                    {safetyData.interactions.map((inter, i) => (
                      <div key={i} className="p-3 border rounded-3 bg-light border-start border-warning border-4">
                        <div className="d-flex justify-content-between">
                          <strong className="text-dark">{inter.drugs}</strong>
                          <span className="badge bg-warning text-dark">{inter.severity}</span>
                        </div>
                        <p className="mb-1 small text-secondary mt-1">{inter.effect}</p>
                        <div className="small fw-semibold text-primary">
                          👉 <strong>Management:</strong> {inter.management}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-success py-2 px-3 small mb-3">
                    ✅ No adverse drug-drug interactions detected between your prescribed tablets.
                  </div>
                )}

                {/* Food & Dietary Warnings */}
                {safetyData.foodWarnings && safetyData.foodWarnings.length > 0 && (
                  <>
                    <h6 className="fw-bold text-dark mt-3 mb-2">🥗 Food & Lifestyle Warnings:</h6>
                    <ul className="list-group mb-3 small">
                      {safetyData.foodWarnings.map((fw, i) => (
                        <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                          <span><strong>{fw.drug}:</strong> {fw.warning}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Key Precautions */}
                {safetyData.keyPrecautions && safetyData.keyPrecautions.length > 0 && (
                  <>
                    <h6 className="fw-bold text-dark mt-3 mb-2">📌 Key Clinical Precautions:</h6>
                    <ul className="list-group list-group-flush small">
                      {safetyData.keyPrecautions.map((prec, i) => (
                        <li key={i} className="list-group-item px-0 py-1 text-muted">
                          • {prec}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="text-end text-muted small mt-3">
                  {t("poweredBy")} {safetyData.source || "Clinical Engine"}
                </div>
              </div>

              <div className="modal-footer bg-light py-2 d-flex justify-content-between">
                <button
                  type="button"
                  className={`btn btn-sm px-3 d-flex align-items-center gap-1 ${
                    isModalSpeechActive ? "btn-danger" : "btn-outline-primary"
                  }`}
                  onClick={async () => {
                    let text = `Clinical safety score is ${safetyData.safetyScore} out of 100. Status: ${safetyData.overallStatus}. ${safetyData.summary}`;
                    if (currentLanguage !== "en") {
                      text = await translate(text);
                    }
                    const isPlaying = toggleSpeech("clinical-modal-eval", text, {
                      lang: speechLangCode,
                      onStart: () => setIsModalSpeechActive(true),
                      onEnd: () => setIsModalSpeechActive(false),
                      onStop: () => setIsModalSpeechActive(false),
                      onError: () => setIsModalSpeechActive(false),
                    });

                    if (isPlaying) {
                      toast.info("🔊 Reading clinical evaluation... (Click again to stop)", { autoClose: 2500 });
                      setIsModalSpeechActive(true);
                    } else {
                      toast.info("⏹️ Stopped clinical voice readout.", { autoClose: 1500 });
                      setIsModalSpeechActive(false);
                    }
                  }}
                >
                  {isModalSpeechActive ? <FaStop /> : <FaVolumeUp />}
                  <span>{isModalSpeechActive ? t("stopVoice") : t("voiceReadout")}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-4"
                  onClick={() => setShowSafetyModal(false)}
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📋 Doctor Prescription Scanner Modal */}
      <PrescriptionScannerModal
        show={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        patientId={patientId}
        onSuccess={() => {
          fetchMedications();
          toast.success("Prescription medications imported successfully!");
        }}
      />

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
        patientName={sessionStorage.getItem("name") || "Patient"}
      />

      {/* 🛍️ Direct Pharmacy Store & Chronic Care Modal */}
      <DirectPharmacyModal
        show={showDirectPharmacyModal}
        onHide={() => setShowDirectPharmacyModal(false)}
        medication={selectedPharmacyItem}
      />

      {/* 🧠 AI Vision & Gemini Key Modal */}
      <AISettingsModal
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
      />
    </div>
  );
};

export default ManageMedication;

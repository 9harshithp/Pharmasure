import React, { useState, useEffect } from "react";
import {
  FaWhatsapp,
  FaSms,
  FaCheckDouble,
  FaTimes,
  FaPaperPlane,
  FaPhoneAlt,
  FaCopy,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  getWhatsAppUrl,
  getSmsUrl,
  simulateGatewayDispatch,
  formatMissedDoseMessage,
  formatZeroRiskExpiryMessage,
  formatRefillAlertMessage,
  formatDailyScheduleMessage,
} from "../utils/notificationService";

const WhatsAppAlertModal = ({
  show,
  onClose,
  initialType = "missed", // 'missed' | 'zeroRisk' | 'refill' | 'schedule'
  patientName = "",
  alertData = {},
}) => {
  const [phone, setPhone] = useState(() => localStorage.getItem("pharmasure_patient_phone") || "+919876543210");
  const [alertType, setAlertType] = useState(initialType);
  const [customMessage, setCustomMessage] = useState("");
  const [isSendingGateway, setIsSendingGateway] = useState(false);
  const [gatewayResult, setGatewayResult] = useState(null);

  useEffect(() => {
    if (initialType) setAlertType(initialType);
  }, [initialType]);

  useEffect(() => {
    // Generate message according to selected type
    let msg = "";
    if (alertType === "missed") {
      msg = formatMissedDoseMessage({
        patientName: patientName || sessionStorage.getItem("name") || "Patient",
        tablets: alertData.tablets || [{ tabletName: "Prescribed Tablet", timing: "Current Slot" }],
        slot: alertData.slot || "Morning",
      });
    } else if (alertType === "zeroRisk") {
      msg = formatZeroRiskExpiryMessage({
        patientName: patientName || sessionStorage.getItem("name") || "Patient",
        medicineName: alertData.medicineName || "Active Medication",
        runoutDate: alertData.runoutDateStr || alertData.runoutDate || "2027-01-15",
        expiryDate: alertData.expiryDate || "2026-11-20",
        daysBuffer: alertData.daysDifference || -5,
      });
    } else if (alertType === "refill") {
      msg = formatRefillAlertMessage({
        patientName: patientName || sessionStorage.getItem("name") || "Patient",
        medicineName: alertData.medicineName || "Prescription",
        remainingQty: alertData.remainingQty || 4,
        daysLeft: alertData.daysLeft || 2,
      });
    } else {
      msg = formatDailyScheduleMessage({
        patientName: patientName || sessionStorage.getItem("name") || "Patient",
        medications: alertData.medications || [],
      });
    }
    setCustomMessage(msg);
    setGatewayResult(null);
  }, [alertType, patientName, alertData]);

  if (!show) return null;

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    localStorage.setItem("pharmasure_patient_phone", e.target.value);
  };

  const handleOpenWhatsApp = () => {
    const url = getWhatsAppUrl(phone, customMessage);
    window.open(url, "_blank");
    toast.success("📲 Opening WhatsApp with clinical alert prefilled!");
  };

  const handleOpenSms = () => {
    const url = getSmsUrl(phone, customMessage);
    window.location.href = url;
    toast.info("💬 Opening native SMS application!");
  };

  const handleSimulateGateway = async (channel) => {
    try {
      setIsSendingGateway(true);
      const res = await simulateGatewayDispatch({
        channel,
        phone,
        message: customMessage,
      });
      setGatewayResult(res);
      toast.success(`🚀 Delivered via ${channel === "whatsapp" ? "WhatsApp Cloud API" : "SMS Gateway"}! SID: ${res.messageId}`);
    } catch (err) {
      toast.error("Failed to dispatch via gateway.");
    } finally {
      setIsSendingGateway(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    toast.success("📋 Message text copied to clipboard!");
  };

  return (
    <div
      className="modal show fade"
      style={{ display: "block", backgroundColor: "rgba(10, 25, 18, 0.75)", zIndex: 1090 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div
            className="modal-header text-white py-3"
            style={{
              background: "linear-gradient(135deg, #075e54 0%, #128c7e 50%, #25d366 100%)",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <span className="p-2 rounded-circle bg-white text-success d-flex align-items-center justify-content-center">
                <FaWhatsapp size={22} />
              </span>
              <div>
                <h5 className="modal-title fw-bold mb-0">
                  WhatsApp & SMS Clinical Alert Dispatcher
                </h5>
                <small className="text-light opacity-90">
                  Instant Mobile Notifications for Patients, Caretakers & Doctors
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          <div className="modal-body p-4" style={{ backgroundColor: "#f0f2f5" }}>
            {/* Recipient Phone Input */}
            <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
              <div className="row g-2 align-items-center">
                <div className="col-md-7">
                  <label className="form-label fw-bold small text-muted mb-1 d-flex align-items-center gap-1">
                    <FaPhoneAlt className="text-success" /> Recipient Mobile / WhatsApp Number:
                  </label>
                  <input
                    type="tel"
                    className="form-control font-monospace fw-semibold"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    Include country code (e.g. +91 for India). Automatically saved for next alerts.
                  </small>
                </div>
                <div className="col-md-5">
                  <label className="form-label fw-bold small text-muted mb-1">
                    Select Alert Template:
                  </label>
                  <select
                    className="form-select form-select-sm fw-semibold"
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                  >
                    <option value="missed">🚨 Missed Dose Alert</option>
                    <option value="zeroRisk">⚠️ Zero-Risk Expiry Conflict</option>
                    <option value="refill">📦 Low Stock Refill Reminder</option>
                    <option value="schedule">📋 Daily Regimen Schedule</option>
                  </select>
                </div>
              </div>
            </div>

            {/* WhatsApp Chat Bubble Live Preview */}
            <div className="card border-0 shadow-sm rounded-3 p-3 mb-3" style={{ backgroundColor: "#efeae2" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted fw-bold d-flex align-items-center gap-1">
                  <FaWhatsapp className="text-success" /> Live WhatsApp Chat Preview
                </span>
                <button
                  className="btn btn-sm btn-link text-muted p-0 text-decoration-none small"
                  onClick={handleCopyMessage}
                >
                  <FaCopy /> Copy Text
                </button>
              </div>

              {/* Chat Bubble */}
              <div
                className="p-3 rounded-3 shadow-sm position-relative ms-auto"
                style={{
                  backgroundColor: "#d9fdd3",
                  maxWidth: "92%",
                  color: "#111b21",
                  fontSize: "13.5px",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                  borderRadius: "8px 0px 8px 8px",
                }}
              >
                {customMessage}
                <div className="text-end mt-1 text-muted small d-flex align-items-center justify-content-end gap-1" style={{ fontSize: "11px" }}>
                  <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <FaCheckDouble className="text-primary" size={12} />
                </div>
              </div>
            </div>

            {/* Delivery Confirmation Alert if Gateway Used */}
            {gatewayResult && (
              <div className="alert alert-success d-flex align-items-center justify-content-between py-2 px-3 mb-3 rounded-3">
                <div className="d-flex align-items-center gap-2">
                  <FaCheckDouble className="text-success" />
                  <span className="small">
                    Dispatched to <strong>+{gatewayResult.recipient}</strong> at {gatewayResult.deliveredAt}!
                  </span>
                </div>
                <span className="badge bg-dark font-monospace">{gatewayResult.messageId}</span>
              </div>
            )}

            {/* Dispatch Action Buttons */}
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center pt-1">
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-success fw-bold d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
                  style={{ backgroundColor: "#25d366", borderColor: "#25d366" }}
                  onClick={handleOpenWhatsApp}
                >
                  <FaWhatsapp size={18} />
                  <span>Open WhatsApp (Web / Mobile)</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-primary fw-bold d-flex align-items-center gap-2 px-3 py-2"
                  onClick={handleOpenSms}
                >
                  <FaSms size={18} />
                  <span>Send via SMS</span>
                </button>
              </div>

              <button
                type="button"
                className="btn btn-dark btn-sm d-flex align-items-center gap-1 px-3 py-2"
                onClick={() => handleSimulateGateway("whatsapp")}
                disabled={isSendingGateway}
              >
                <FaPaperPlane size={12} />
                <span>{isSendingGateway ? "Dispatching..." : "Simulate Cloud Gateway"}</span>
              </button>
            </div>
          </div>

          <div className="modal-footer bg-white py-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm px-4"
              onClick={onClose}
            >
              <FaTimes className="me-1" /> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppAlertModal;

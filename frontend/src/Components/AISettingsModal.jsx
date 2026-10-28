import React, { useState, useEffect } from "react";
import { FaKey, FaCheckCircle, FaInfoCircle, FaExternalLinkAlt, FaBrain } from "react-icons/fa";
import { getStoredGeminiKey, setStoredGeminiKey } from "../utils/ocrScanner";
import { GoogleGenAI } from "@google/genai";
import { toast } from "react-toastify";

const AISettingsModal = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKey, setApiKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredGeminiKey() || "");
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredGeminiKey(apiKey.trim());
    toast.success(apiKey.trim() ? "Gemini API Key saved successfully!" : "Using Clinical Offline AI Engine.");
    if (onKeyUpdated) onKeyUpdated(apiKey.trim());
    onClose();
  };

  const handleClear = () => {
    setApiKey("");
    setStoredGeminiKey("");
    setTestResult(null);
    toast.info("Cleared custom key. Operating in Offline Clinical Mode.");
    if (onKeyUpdated) onKeyUpdated("");
  };

  const handleTestConnection = async () => {
    const key = apiKey.trim();
    if (!key) {
      toast.warning("Please enter an API key first.");
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    try {
      const genAI = new GoogleGenAI({ apiKey: key });
      const candidateModels = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.5-flash"];
      let successModel = null;

      for (const m of candidateModels) {
        try {
          const res = await genAI.models.generateContent({
            model: m,
            contents: "Say 'OK' in 1 word.",
          });
          if (res?.text) {
            successModel = m;
            break;
          }
        } catch (e) {
          console.warn(`Model ${m} test:`, e.message || e);
        }
      }

      if (successModel) {
        setTestResult({
          success: true,
          message: `Connection Verified! Successfully connected to Google ${successModel}.`,
        });
        toast.success(`Connected to Google ${successModel}!`);
      } else {
        throw new Error("Unable to authenticate with Gemini candidate models.");
      }
    } catch (err) {
      console.error("Gemini test failed:", err);
      setTestResult({
        success: false,
        message: err.message || "Failed to connect. Check your API key or network.",
      });
      toast.error("API Key validation failed.");
    } finally {
      setIsTesting(false);
    }
  };

  const hasValidKey = Boolean(apiKey && apiKey.trim().length > 15);

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 1060,
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content shadow-lg border-0"
          style={{
            borderRadius: "16px",
            background: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="modal-header border-bottom py-3 px-4"
            style={{
              background: "linear-gradient(135deg, #0F2942 0%, #1E3A8A 100%)",
              color: "#FFFFFF",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <FaBrain size={20} style={{ color: "#06B6D4" }} />
              <h5 className="modal-title fw-bold mb-0" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                AI & Vision Engine Settings
              </h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {/* Status Indicator */}
            <div
              className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
              style={{
                background: hasValidKey ? "rgba(34, 197, 94, 0.08)" : "rgba(6, 182, 212, 0.08)",
                border: `1px solid ${hasValidKey ? "rgba(34, 197, 94, 0.3)" : "rgba(6, 182, 212, 0.3)"}`,
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <span
                  className="rounded-circle"
                  style={{
                    width: "12px",
                    height: "12px",
                    background: hasValidKey ? "#22C55E" : "#06B6D4",
                    boxShadow: `0 0 8px ${hasValidKey ? "#22C55E" : "#06B6D4"}`,
                    display: "inline-block",
                  }}
                />
                <div>
                  <div className="fw-semibold small" style={{ color: "#0F2942" }}>
                    {hasValidKey ? "Cloud Multimodal AI (Active)" : "Clinical Offline AI (Active)"}
                  </div>
                  <div className="text-muted" style={{ fontSize: "11px" }}>
                    {hasValidKey
                      ? "Powered by Google Gemini Flash Engine (Default Key Active)"
                      : "High-precision in-browser OCR & Clinical Wellness Assistant"}
                  </div>
                </div>
              </div>
              <span
                className="badge"
                style={{
                  background: hasValidKey ? "#22C55E" : "#0891B2",
                  fontSize: "10px",
                }}
              >
                {hasValidKey ? "CLOUD AI" : "OFFLINE READY"}
              </span>
            </div>

            {/* API Key Input */}
            <div className="mb-3">
              <label className="form-label fw-semibold small" style={{ color: "#334155" }}>
                <FaKey className="me-1" style={{ color: "#06B6D4" }} />
                Google Gemini API Key (Optional)
              </label>
              <div className="input-group">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Paste your AIzaSy... API key"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestResult(null);
                  }}
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px 0 0 8px",
                    fontSize: "14px",
                  }}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !apiKey.trim()}
                  style={{ fontSize: "13px", fontWeight: 500 }}
                >
                  {isTesting ? "Testing..." : "Test Key"}
                </button>
              </div>
              <div className="form-text small mt-2" style={{ fontSize: "12px", color: "#64748B" }}>
                Leave blank to use the high-precision offline OCR & wellness engine.
                To get a free key, visit{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0891B2", textDecoration: "underline" }}
                >
                  Google AI Studio <FaExternalLinkAlt size={10} />
                </a>.
              </div>
            </div>

            {/* Test Feedback */}
            {testResult && (
              <div
                className={`alert py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-0 ${
                  testResult.success ? "alert-success" : "alert-danger"
                }`}
              >
                {testResult.success ? <FaCheckCircle size={14} /> : <FaInfoCircle size={14} />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-top py-2 px-4 d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleClear}
              disabled={!apiKey}
            >
              Reset to Offline Mode
            </button>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm bio-btn-glow px-3"
                onClick={handleSave}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettingsModal;

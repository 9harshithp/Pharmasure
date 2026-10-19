import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaNotesMedical,
  FaFileImage,
  FaCheckCircle,
  FaTimes,
  FaCloudUploadAlt,
  FaUserMd,
  FaPills,
} from "react-icons/fa";
import { scanDoctorPrescription } from "../utils/prescriptionScanner";
import { useLanguage } from "../context/LanguageContext";
import { baseUrl } from "../App";
import { speakText } from "../utils/voiceAssistant";

const PrescriptionScannerModal = ({ show, onClose, onImportSuccess, patientId }) => {
  const { t, currentLanguage, translate, speechLangCode } = useLanguage();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  if (!show) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setScanResult(null);
      setSelectedMeds([]);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    setProgress("Initializing Multimodal Vision Engine...");

    try {
      const res = await scanDoctorPrescription(file, (msg) => setProgress(msg));
      setScanResult(res);
      setSelectedMeds(res.medications.map((_, i) => i));

      let spoken = `Deciphered ${res.medications.length} medicines prescribed by ${res.doctorName}.`;
      if (currentLanguage !== "en") {
        spoken = await translate(spoken);
      }
      speakText(spoken, { lang: speechLangCode });
      toast.success(`✅ Extracted ${res.medications.length} medicines from prescription!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse prescription slip. Please check image clarity.");
    } finally {
      setIsScanning(false);
      setProgress("");
    }
  };

  const toggleMedSelect = (index) => {
    setSelectedMeds((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleImportAll = async () => {
    if (!scanResult || selectedMeds.length === 0) return;
    setIsImporting(true);

    let successCount = 0;
    try {
      for (const idx of selectedMeds) {
        const med = scanResult.medications[idx];
        const payload = {
          tableName: med.tableName,
          tabletQty: med.tabletQty,
          timing: med.timing.join(", "),
          doctor: med.doctor || scanResult.doctorName || "Prescribing Doctor",
          expiryDate: med.expiryDate,
        };

        await axios.post(`${baseUrl}/medications/add/${patientId}`, payload);
        successCount++;
      }

      toast.success(`🎉 Successfully added ${successCount} medications to your schedule!`);
      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch (err) {
      console.error("Error importing scanned meds:", err);
      toast.error("Error importing some medications to your schedule.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div
      className="modal show fade"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1070 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4">
          {/* Header */}
          <div className="modal-header bg-gradient text-white py-3" style={{ background: "linear-gradient(135deg, #1d4ed8, #4338ca)" }}>
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <FaNotesMedical /> {t("scanDoctorPrescription") || "AI Doctor Handwritten Prescription Scanner"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={isScanning || isImporting}
            />
          </div>

          <div className="modal-body p-4">
            {/* Upload Area */}
            {!scanResult && (
              <div className="text-center p-4 border border-2 border-dashed rounded-4 bg-light mb-3">
                <FaCloudUploadAlt size={48} className="text-primary mb-2" />
                <h6 className="fw-bold">Upload Handwritten Prescription Slip</h6>
                <p className="text-muted small mb-3">
                  Snap or upload a photo of the doctor's cursive prescription sheet. Multimodal AI will decipher drug names, dosages, and timings.
                </p>

                <input
                  type="file"
                  id="prescriptionFileInput"
                  accept="image/*"
                  className="d-none"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="prescriptionFileInput"
                  className="btn btn-primary px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                >
                  <FaFileImage /> {file ? "Choose Another Photo" : "Select Prescription Photo"}
                </label>

                {preview && (
                  <div className="mt-3">
                    <img
                      src={preview}
                      alt="Prescription Preview"
                      className="img-thumbnail shadow-sm rounded-3"
                      style={{ maxHeight: "240px" }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Scan Action */}
            {file && !scanResult && (
              <div className="text-center mb-3">
                <button
                  className="btn btn-success px-4 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                  onClick={handleScan}
                  disabled={isScanning}
                >
                  <FaNotesMedical /> {isScanning ? (progress || "Deciphering Handwriting...") : "Decipher Prescription with AI"}
                </button>
                {isScanning && (
                  <div className="mt-2 text-primary small fw-semibold">
                    ⏳ {progress}
                  </div>
                )}
              </div>
            )}

            {/* Deciphered Results */}
            {scanResult && (
              <div>
                {/* Doctor Banner */}
                <div className="p-3 bg-light rounded-3 border mb-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div>
                    <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                      <FaUserMd className="text-primary" /> {scanResult.doctorName}
                    </h6>
                    <small className="text-muted">{scanResult.clinic} • {scanResult.diagnosis}</small>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success px-3 py-2">
                    ⚡ {scanResult.engine}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0 text-dark">
                    📋 Deciphered Medications ({scanResult.medications.length})
                  </h6>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setScanResult(null);
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    Scan Another
                  </button>
                </div>

                <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: "320px", overflowY: "auto" }}>
                  {scanResult.medications.map((med, idx) => {
                    const isChecked = selectedMeds.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleMedSelect(idx)}
                        className={`p-3 rounded-3 border d-flex justify-content-between align-items-center cursor-pointer transition ${
                          isChecked ? "bg-white border-primary shadow-sm" : "bg-light text-muted"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <input
                            type="checkbox"
                            className="form-check-input mt-0 fs-5"
                            checked={isChecked}
                            onChange={() => toggleMedSelect(idx)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div>
                            <div className="fw-bold text-dark d-flex align-items-center gap-2">
                              <FaPills className="text-primary" /> {med.tableName}
                            </div>
                            <div className="small text-muted mt-1 d-flex flex-wrap gap-2 align-items-center">
                              <span>Qty: <strong>{med.tabletQty}</strong> tabs</span>
                              <span>•</span>
                              <span>Duration: <strong>{med.courseDays} days</strong></span>
                              <span>•</span>
                              <span className="fst-italic">{med.instructions}</span>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex gap-1">
                          {med.timing.map((t, ti) => (
                            <span key={ti} className="badge bg-primary-subtle text-primary border border-primary small">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light py-2 d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3"
              onClick={onClose}
              disabled={isImporting}
            >
              <FaTimes className="me-1" /> Close
            </button>

            {scanResult && (
              <button
                type="button"
                className="btn btn-primary btn-sm px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
                onClick={handleImportAll}
                disabled={isImporting || selectedMeds.length === 0}
              >
                <FaCheckCircle />
                {isImporting ? "Importing to Schedule..." : `Import Selected (${selectedMeds.length})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionScannerModal;

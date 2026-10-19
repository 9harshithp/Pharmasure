import React, { useState } from "react";
import axios from "axios";
import { FaPills, FaCheck, FaVolumeUp, FaStop } from "react-icons/fa";
import { toast } from "react-toastify";
import { baseUrl } from "../App";
import { speakText, toggleSpeech } from "../utils/voiceAssistant";
import { useLanguage } from "../context/LanguageContext";

const QuickDoseFAB = ({ onDoseLogged }) => {
  const { t, currentLanguage, translate, speechLangCode } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggingId, setLoggingId] = useState(null);
  const [activeSpeechMid, setActiveSpeechMid] = useState(null);

  const patientId = sessionStorage.getItem("pid");

  const fetchPatientMedications = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/medications/get/patient/${patientId}`);
      if (res.data && Array.isArray(res.data)) {
        setMedications(res.data);
      }
    } catch (err) {
      console.error("Error loading medications for QuickDose:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    fetchPatientMedications();
    setIsOpen(true);
  };

  const handleLogDose = async (med) => {
    setLoggingId(med.mid);
    try {
      const res = await axios.post(`${baseUrl}/consumed/add/${med.mid}`);
      if (res.status === 200) {
        const remaining = Math.max(0, (med.tabletQty || 1) - 1);
        toast.success(`✅ ${med.tableName} marked as taken! Dose logged.`, {
          position: "top-center",
          autoClose: 2500,
        });

        let spokenText = `Dose recorded for ${med.tableName}. You have ${remaining} tablets remaining.`;
        if (currentLanguage !== "en") {
          spokenText = await translate(spokenText);
        }
        speakText(spokenText, { lang: speechLangCode });

        // Update local stock count immediately
        setMedications((prev) =>
          prev.map((m) =>
            m.mid === med.mid
              ? { ...m, tabletQty: remaining }
              : m
          )
        );

        if (onDoseLogged) {
          onDoseLogged(med);
        }
      }
    } catch (err) {
      console.error("Failed to log dose:", err);
      toast.error("❌ Failed to log dose. Please try again.");
    } finally {
      setLoggingId(null);
    }
  };

  if (!patientId) return null;

  return (
    <>
      {/* 🚀 Floating 1-Tap Quick Action Button */}
      <button
        className="btn btn-primary fab-quick-dose"
        onClick={handleOpen}
        title={t("quickDose")}
      >
        <FaPills className="fs-5" />
        <span>{t("quickDose")}</span>
      </button>

      {/* 📋 Quick-Dose Logging Modal */}
      {isOpen && (
        <div
          className="modal show fade"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-primary text-white py-3">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FaPills /> {t("quickDose")}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsOpen(false)}
                />
              </div>

              <div className="modal-body p-3">
                <p className="text-muted small mb-3">
                  Tap below to immediately record your dose and sync with your adherence chart:
                </p>

                {loading ? (
                  <div className="text-center py-4 text-muted">Loading your schedule...</div>
                ) : medications.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    No active medications found in your schedule.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {medications.map((med) => (
                      <div
                        key={med.mid}
                        className="p-3 rounded-3 border d-flex justify-content-between align-items-center bg-light"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className={`btn btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center ${
                              activeSpeechMid === med.mid
                                ? "btn-danger text-white border-0 shadow-sm"
                                : "btn-outline-primary"
                            }`}
                            style={{ width: "32px", height: "32px" }}
                            title={activeSpeechMid === med.mid ? "Click to stop voice" : "Hear dose instructions"}
                            onClick={async () => {
                              const speechKey = `fab-${med.mid}`;
                              let text = `Take ${med.tableName}. Timing: ${med.timing}. You have ${med.tabletQty} tablets remaining in your supply.`;
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
                            {activeSpeechMid === med.mid ? <FaStop size={11} /> : <FaVolumeUp size={12} />}
                          </button>
                          <div>
                            <div className="fw-bold text-dark">{med.tableName}</div>
                            <div className="small text-muted">
                              <span className="badge bg-secondary me-1">{med.timing}</span>
                              Remaining: <strong>{med.tabletQty}</strong> tabs
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn btn-success btn-sm px-3 fw-bold d-flex align-items-center gap-1"
                          onClick={() => handleLogDose(med)}
                          disabled={loggingId === med.mid || med.tabletQty <= 0}
                        >
                          {loggingId === med.mid ? (
                            "Logging..."
                          ) : (
                            <>
                              <FaCheck /> Mark Taken
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light py-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickDoseFAB;

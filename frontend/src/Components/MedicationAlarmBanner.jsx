import React, { useState, useEffect, useRef } from "react";
import { FaCheck, FaTimes, FaPills, FaClock, FaVolumeUp } from "react-icons/fa";
import { alarmAudio } from "../utils/alarmAudio";
import { baseUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";

const MedicationAlarmBanner = () => {
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const timerRef = useRef(null);
  const triggeredTimesRef = useRef(new Set());

  // Check current time against patient's scheduled medications
  useEffect(() => {
    const checkSchedule = async () => {
      const patientId = sessionStorage.getItem("pid");
      if (!patientId || activeAlarm) return;

      try {
        const res = await axios.get(`${baseUrl}/medications/get/patient/${patientId}`);
        const medications = res.data || [];
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeStr = `${String(currentHours).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`;

        // Map general timing labels to standard stipulated hours
        // Morning: 09:00 (9 AM)
        // Afternoon: 13:00 (1 PM)
        // Evening: 18:00 (6 PM)
        // Night: 21:00 (9 PM)
        medications.forEach((med) => {
          let shouldTrigger = false;
          let timingSlot = "";

          const timings = Array.isArray(med.timing)
            ? med.timing
            : typeof med.timing === "string"
            ? med.timing.split(",").map((s) => s.trim())
            : [];

          timings.forEach((t) => {
            const lower = t.toLowerCase();
            if (lower.includes("morning") && currentHours === 9 && currentMinutes === 0) {
              shouldTrigger = true;
              timingSlot = "Morning (9:00 AM)";
            } else if (lower.includes("afternoon") && currentHours === 13 && currentMinutes === 0) {
              shouldTrigger = true;
              timingSlot = "Afternoon (1:00 PM)";
            } else if (lower.includes("evening") && currentHours === 18 && currentMinutes === 0) {
              shouldTrigger = true;
              timingSlot = "Evening (6:00 PM)";
            } else if (lower.includes("night") && currentHours === 21 && currentMinutes === 0) {
              shouldTrigger = true;
              timingSlot = "Night (9:00 PM)";
            } else if (t.includes(":") && t.trim() === currentTimeStr) {
              shouldTrigger = true;
              timingSlot = t;
            }
          });

          const alarmKey = `${med.mid || med.id}-${currentTimeStr}-${now.toDateString()}`;
          if (shouldTrigger && !triggeredTimesRef.current.has(alarmKey)) {
            triggeredTimesRef.current.add(alarmKey);
            triggerAlarm({
              medId: med.mid || med.id,
              tableName: med.tableName || med.medicineName || "Scheduled Medication",
              doctor: med.doctor || "Consulting Physician",
              timingSlot: timingSlot || "Stipulated Dose",
              tabletQty: med.tabletQty || "1 Dose",
            });
          }
        });
      } catch (err) {
        // fail silently during background check
      }
    };

    // Run check every 15 seconds
    const interval = setInterval(checkSchedule, 15000);
    checkSchedule();

    return () => clearInterval(interval);
  }, [activeAlarm]);

  // Handle countdown timer when alarm is sounding
  useEffect(() => {
    if (activeAlarm) {
      setSecondsRemaining(60);
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleTurnOff();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeAlarm]);

  // Trigger alarm function
  const triggerAlarm = (alarmData) => {
    setActiveAlarm(alarmData);

    // Start 1-minute Web Audio synthesizer
    alarmAudio.startAlarm(60, () => {
      setActiveAlarm(null);
    });

    // Mobile vibration if supported
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([400, 200, 400, 200, 800]);
      } catch (e) {}
    }
  };

  // Turn off / dismiss alarm
  const handleTurnOff = () => {
    alarmAudio.stop();
    setActiveAlarm(null);
    toast.info("Alarm silenced.", { autoClose: 2000 });
  };

  // Mark medication as taken
  const handleMarkTaken = async () => {
    alarmAudio.stop();
    const medName = activeAlarm?.tableName || "Medication";
    const patientId = sessionStorage.getItem("pid");

    try {
      if (patientId) {
        // Record consumed dose in database
        await axios.post(`${baseUrl}/consumed/add`, {
          pid: patientId,
          tableName: medName,
          status: "TAKEN",
          timestamp: new Date().toISOString(),
        }).catch(() => {});
      }
    } catch (err) {
      // Continue to give user feedback
    }

    setActiveAlarm(null);
    toast.success(`✅ Great job! ${medName} marked as taken. Dose successfully logged.`, {
      autoClose: 3500,
      position: "top-center",
    });
  };

  // Allow global test trigger via custom event
  useEffect(() => {
    const handleTestEvent = (e) => {
      triggerAlarm({
        medId: "test-9am",
        tableName: e.detail?.tableName || "Metformin 500mg (Daily Dose)",
        doctor: e.detail?.doctor || "Dr. Sharma (Cardio-Diabetologist)",
        timingSlot: "Stipulated 9:00 AM Slot",
        tabletQty: "1 Tablet After Breakfast",
      });
    };

    window.addEventListener("testMedicationAlarm", handleTestEvent);
    return () => window.removeEventListener("testMedicationAlarm", handleTestEvent);
  }, []);

  if (!activeAlarm) {
    return null;
  }

  return (
    <div
      className="position-fixed top-0 start-50 translate-middle-x mt-3 px-3 w-100"
      style={{
        maxWidth: "680px",
        zIndex: 10001,
        animation: "slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        className="p-3 p-md-4 rounded-4 shadow-lg text-white position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0F2942 0%, #7F1D1D 50%, #991B1B 100%)",
          border: "2px solid #EF4444",
          boxShadow: "0 12px 40px rgba(220, 38, 38, 0.55), 0 0 25px rgba(239, 68, 68, 0.3)",
        }}
      >
        {/* Animated Sound Waves Indicator */}
        <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom border-light border-opacity-25">
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge bg-danger rounded-pill px-2 py-1 d-flex align-items-center gap-1 shadow-sm"
              style={{ fontSize: "11px", letterSpacing: "0.05em" }}
            >
              <FaVolumeUp className="bio-glow-pulse" /> ALARM RINGING ({secondsRemaining}s remaining)
            </span>
            <span className="small font-mono text-warning d-flex align-items-center gap-1" style={{ fontSize: "12px" }}>
              <FaClock /> {activeAlarm.timingSlot}
            </span>
          </div>

          <button
            onClick={handleTurnOff}
            className="btn btn-sm btn-link text-white-50 p-0 text-decoration-none"
            title="Turn off alarm"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Medication Details Card */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 my-2">
          <div className="d-flex align-items-center gap-3">
            <div
              className="p-3 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#FEE2E2",
              }}
            >
              <FaPills size={26} />
            </div>
            <div>
              <div className="small font-mono text-uppercase text-warning fw-semibold" style={{ fontSize: "11px" }}>
                Prescribed Medication Due Now
              </div>
              <h4 className="h5 fw-bold mb-0 text-white" style={{ letterSpacing: "-0.01em" }}>
                {activeAlarm.tableName}
              </h4>
              <div className="small text-white-50 mt-1 font-mono" style={{ fontSize: "12px" }}>
                {activeAlarm.tabletQty} • Prescribed by {activeAlarm.doctor}
              </div>
            </div>
          </div>

          {/* User Action Buttons: Turn Off vs Mark as Taken */}
          <div className="d-flex flex-sm-column gap-2 flex-shrink-0">
            <button
              onClick={handleMarkTaken}
              className="btn btn-success fw-bold d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-pill shadow-sm"
              style={{
                fontSize: "13px",
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                border: "none",
              }}
            >
              <FaCheck /> Mark as Taken
            </button>

            <button
              onClick={handleTurnOff}
              className="btn btn-outline-light d-flex align-items-center justify-content-center gap-1.5 py-1.5 px-3 rounded-pill"
              style={{ fontSize: "12px", borderColor: "rgba(255,255,255,0.4)" }}
            >
              <FaTimes /> Turn Off Alarm
            </button>
          </div>
        </div>

        {/* Progress Bar of 1-minute alarm */}
        <div className="progress mt-2" style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.2)" }}>
          <div
            className="progress-bar bg-warning progress-bar-striped progress-bar-animated"
            style={{ width: `${(secondsRemaining / 60) * 100}%`, transition: "width 1s linear" }}
          />
        </div>
      </div>
    </div>
  );
};

export default MedicationAlarmBanner;

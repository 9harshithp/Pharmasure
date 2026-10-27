import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { baseUrl } from "../App";
import {
  FaPills,
  FaChartLine,
  FaCheckCircle,
  FaUser,
  FaBrain,
  FaBell,
  FaSignOutAlt,
  FaFilePdf,
  FaVolumeUp,
  FaStop,
  FaWhatsapp,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getZeroRiskSummary } from "../utils/predictiveRiskCalculator";
import QuickDoseFAB from "./QuickDoseFAB";
import { generateDoctorSummaryReport } from "../utils/clinicalReportGenerator";
import { toggleSpeech } from "../utils/voiceAssistant";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import WhatsAppAlertModal from "./WhatsAppAlertModal";

const UserDashBoard = () => {
  const { t, currentLanguage, translate, speechLangCode } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [role, setRole] = useState("patient");
  const [alertStatus, setAlertStatus] = useState(false);
  const [pid, setPid] = useState(null);
  const [zeroRiskAlerts, setZeroRiskAlerts] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [missedTablets, setMissedTablets] = useState([]);
  const [showMissedModal, setShowMissedModal] = useState(false);
  const [isVoiceAlertPlaying, setIsVoiceAlertPlaying] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppType, setWhatsAppType] = useState("missed");
  const [whatsAppAlertData, setWhatsAppAlertData] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleVoiceAlert = async () => {
    let text = `Critical Zero-risk alert. You have ${zeroRiskAlerts.length} medications whose remaining supply extends past their batch expiry date. Please review your regimen.`;
    if (currentLanguage !== "en") {
      text = await translate(text);
    }
    const playing = toggleSpeech("zero-risk-dashboard-alert", text, {
      lang: speechLangCode,
      onStart: () => setIsVoiceAlertPlaying(true),
      onEnd: () => setIsVoiceAlertPlaying(false),
      onStop: () => setIsVoiceAlertPlaying(false),
      onError: () => setIsVoiceAlertPlaying(false),
    });

    if (playing) {
      toast.info(`🔊 ${t("voiceAlert")}... (${t("stopVoice")})`, { autoClose: 2500 });
      setIsVoiceAlertPlaying(true);
    } else {
      toast.info(`⏹️ ${t("stopVoice")}.`, { autoClose: 1500 });
      setIsVoiceAlertPlaying(false);
    }
  };

  useEffect(() => {
    const storedName = sessionStorage.getItem("name");
    const storedRole = sessionStorage.getItem("role");
    const storedPid = sessionStorage.getItem("pid");
    const storedEmail = sessionStorage.getItem("email");
    const medicationChecked = sessionStorage.getItem("medicationChecked");

    if (!storedName || !storedPid || !storedEmail) {
      navigate("/");
      return;
    }

    setName(storedName);
    setRole(storedRole);
    setPid(storedPid);

    fetchAlertStatus(storedPid, storedRole);
    checkZeroRiskCompliance(storedPid);
    
    if (!medicationChecked) {
      checkMedicationStatus(storedEmail);
      sessionStorage.setItem("medicationChecked", "true");
    }
  }, [navigate]);

  const checkZeroRiskCompliance = async (patientPid) => {
    try {
      const res = await axios.get(`${baseUrl}/medications/get/patient/${patientPid}`);
      if (res.data && Array.isArray(res.data)) {
        const summary = getZeroRiskSummary(res.data);
        if (summary.violations > 0 || summary.expired > 0) {
          setZeroRiskAlerts(
            summary.details.filter(
              (d) => d.status === "RUNOUT_EXCEEDS_EXPIRY" || d.status === "EXPIRED"
            )
          );
        }
      }
    } catch (err) {
      console.error("Error checking zero-risk compliance:", err);
    }
  };

  const fetchAlertStatus = async (id, userRole) => {
    try {
      const response = await axios.get(`${baseUrl}/getById/${id}`);
      if (response.status === 200) {
        const alertValue = response.data.alert;
        setAlertStatus(alertValue);
        sessionStorage.setItem("alert", alertValue.toString());
        if (userRole === "caretaker" && alertValue) {
          setShowAlertModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching alert status:", error);
    }
  };

  // const checkMedicationStatus = async (email) => {
  //   try {
  //     const res = await axios.get(`${baseUrl}/consumed/check/${email}`);
  //     if (res.status === 200) {
  //       const meds = res.data;
  //       const now = new Date();
  //       const timeInMinutes = now.getHours() * 60 + now.getMinutes();


  //       const morningEnd = 9 * 60 + 30; // 9:30 AM
  //       const afternoonEnd = 14 * 60 + 30; // 2:30 PM
  //       const eveningEnd = 19 * 60 + 30; // 7:30 PM

  //       let relevantTimings = [];

  //       if (timeInMinutes > eveningEnd) {
  //         relevantTimings = ["morning", "afternoon", "evening"];
  //       } else if (timeInMinutes > afternoonEnd) {
  //         relevantTimings = ["morning", "afternoon"];
  //       } else if (timeInMinutes > morningEnd) {
  //         relevantTimings = ["morning"];
  //       }

  //       const missed = meds.filter(
  //         (m) =>
  //           relevantTimings.includes(m.timing.toLowerCase()) &&
  //           m.status.includes("not taken")
  //       );

  //       if (missed.length > 0) {
  //         setMissedTablets(missed);
  //         setShowMissedModal(true);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error checking medication status:", err);
  //   }


  // };

  const checkMedicationStatus = async (email) => {
  try {
    const res = await axios.get(`${baseUrl}/consumed/check/${email}`);
    if (res.status === 200) {
      const meds = res.data;
      const now = new Date();
      const timeInMinutes = now.getHours() * 60 + now.getMinutes();

      const morningEnd = 9 * 60 + 30; // 9:30 AM
      const afternoonEnd = 14 * 60 + 30; // 2:30 PM
      const eveningEnd = 19 * 60 + 30; // 7:30 PM

      // Determine current timing window
      let currentTiming = "";
      if (timeInMinutes <= morningEnd) {
        currentTiming = "morning";
      } else if (timeInMinutes <= afternoonEnd) {
        currentTiming = "afternoon";
      } else if (timeInMinutes <= eveningEnd) {
        currentTiming = "evening";
      }

      // Filter only current timing’s missed medicines
      const missed = meds.filter(
        (m) =>
          m.timing.toLowerCase() === currentTiming &&
          m.status.includes("not taken")
      );

      if (missed.length > 0) {
        setMissedTablets(missed);
        setShowMissedModal(true);
      }
    }
  } catch (err) {
    console.error("Error checking medication status:", err);
  }
};


  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const handleGenerateDoctorReport = async () => {
    if (!pid) return;
    try {
      toast.info("Generating Clinical Summary PDF...", { autoClose: 1500 });
      const [patientRes, medsRes, consumedRes] = await Promise.all([
        axios.get(`${baseUrl}/getById/${pid}`),
        axios.get(`${baseUrl}/medications/get/patient/${pid}`),
        axios.get(`${baseUrl}/consumed/bypatient/${pid}`).catch(() => ({ data: [] })),
      ]);

      generateDoctorSummaryReport(
        patientRes.data,
        medsRes.data || [],
        consumedRes.data || []
      );
      toast.success("✅ Clinical report downloaded!");
    } catch (err) {
      console.error("Error generating report:", err);
      toast.error("❌ Failed to generate report.");
    }
  };

  const handleAlert = async () => {
    if (!pid) return;
    try {
      const response = await axios.put(`${baseUrl}/setAlert/${pid}`);
      if (response.status === 200) {
        setAlertStatus(true);
        sessionStorage.setItem("alert", "true");
        toast.success("Alert sent successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to send alert!");
    }
  };

  const handleClearAlert = async () => {
    if (!pid) return;
    try {
      const response = await axios.put(`${baseUrl}/clearAlert/${pid}`);
      if (response.status === 200) {
        setAlertStatus(false);
        setShowAlertModal(false);
        sessionStorage.setItem("alert", "false");
        toast.success("Alert cleared successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to clear alert!");
    }
  };

  return (
    <div className="d-flex flex-column flex-lg-row" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
  <ToastContainer position="top-center" autoClose={2000} />

  {/* 📱 Mobile Top Navigation Bar */}
  <header
    className="d-lg-none dashboard-mobile-header sticky-top py-2 px-3 text-white shadow-sm"
    style={{
      background: "linear-gradient(135deg, #09081e 0%, #0d0b27 100%)",
      borderBottom: "1px solid rgba(0, 245, 212, 0.25)",
      zIndex: 1030,
    }}
  >
    <div className="d-flex justify-content-between align-items-center">
      {/* Brand - Official PharmaSure Logo */}
      <div
        className="d-flex align-items-center"
        role="button"
        onClick={() => {
          navigate("/userDashboard/manageMedication");
          setIsMobileMenuOpen(false);
        }}
        style={{ cursor: "pointer" }}
      >
        <div className="bg-white rounded-2 px-2 py-1 d-inline-flex align-items-center shadow-sm">
          <picture>
            <source srcSet="/pharmasure-logo-full.webp" type="image/webp" />
            <img
              src="/pharmasure-logo-full.png"
              alt="PharmaSure"
              width="85"
              height="28"
              style={{ height: "26px", width: "auto", objectFit: "contain" }}
            />
          </picture>
        </div>
      </div>

      {/* Right controls */}
      <div className="d-flex align-items-center gap-2">
        <LanguageSelector variant="dark" />
        <button
          className="btn btn-sm btn-outline-light d-flex align-items-center justify-content-center p-2 rounded-2"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle Navigation Menu"
          style={{ borderColor: "rgba(255, 255, 255, 0.25)", minWidth: "36px", height: "36px" }}
        >
          {isMobileMenuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
        </button>
      </div>
    </div>

    {/* Slide-down Mobile Menu for Actions & Extras */}
    {isMobileMenuOpen && (
      <div
        className="pt-3 pb-2 mt-2 border-top border-secondary border-opacity-25"
        style={{ animation: "fadeIn 0.2s ease" }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3 px-1 text-light small">
          <span>👤 {name} ({role})</span>
          <span className="badge bg-secondary font-mono">ID: #{pid}</span>
        </div>

        <div className="d-flex flex-column gap-2">
          <button
            className="btn btn-outline-info w-100 text-white text-start d-flex align-items-center gap-2 rounded-3 py-2"
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleGenerateDoctorReport();
            }}
          >
            <FaFilePdf /> <span>{t("downloadDoctorReport")}</span>
          </button>

          <button
            className="btn btn-outline-success w-100 fw-bold d-flex align-items-center justify-content-start gap-2 rounded-3 py-2 text-start"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setWhatsAppType("schedule");
              setWhatsAppAlertData({ medications: [] });
              setShowWhatsAppModal(true);
            }}
          >
            <FaWhatsapp size={16} /> <span>{t("whatsAppAlerts") || "WhatsApp & SMS Alerts"}</span>
          </button>

          {role === "patient" && (
            <button
              className={`btn ${alertStatus ? "btn-secondary" : "btn-warning"} w-100 fw-bold d-flex align-items-center justify-content-start gap-2 rounded-3 py-2`}
              disabled={alertStatus}
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleAlert();
              }}
            >
              <FaBell /> <span>{alertStatus ? t("alertSent") : t("sendAlert")}</span>
            </button>
          )}

          <button
            className="btn btn-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 mt-2"
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
          >
            <FaSignOutAlt /> <span>{t("logout")}</span>
          </button>
        </div>
      </div>
    )}
  </header>

  {/* Sidebar (Desktop Only) */}
  <div
    className="d-none d-lg-flex dashboard-desktop-sidebar flex-column p-3 text-white"
    style={{
      width: "270px",
      minHeight: "100vh",
      background: "linear-gradient(180deg, #09081e 0%, #0d0b27 50%, #070716 100%)",
      borderRight: "1px solid rgba(255, 255, 255, 0.08)",
      boxShadow: "4px 0 25px rgba(0, 0, 0, 0.3)",
    }}
  >
    {/* Official PharmaSure Logo */}
    <div
      className="d-flex align-items-center justify-content-center mb-3 pt-2"
      role="button"
      onClick={() => navigate("/")}
      style={{ cursor: "pointer" }}
    >
      <div className="bg-white rounded-3 px-3 py-1.5 d-inline-flex align-items-center shadow-sm">
        <picture>
          <source srcSet="/pharmasure-logo-full.webp" type="image/webp" />
          <img
            src="/pharmasure-logo-full.png"
            alt="PharmaSure"
            width="110"
            height="40"
            style={{ height: "34px", width: "auto", objectFit: "contain" }}
          />
        </picture>
      </div>
    </div>
    
    {/* Global Language Selector */}
    <div className="mb-4 text-center">
      <LanguageSelector variant="dark" />
    </div>

    <ul className="nav flex-column text-start gap-1">
      <li className="nav-item">
        <Link to="/userDashBoard/manageMedication" className="nav-link text-white rounded-3 py-2 px-3 d-flex align-items-center transition" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
          <FaPills className="me-2 text-primary" /> {t("manageMedication")}
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/userDashBoard/consumedChart" className="nav-link text-light opacity-85 rounded-3 py-2 px-3 d-flex align-items-center transition">
          <FaChartLine className="me-2 text-info" /> {t("consumedChart")}
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/userDashBoard/ConsumedCount" className="nav-link text-light opacity-85 rounded-3 py-2 px-3 d-flex align-items-center transition">
          <FaCheckCircle className="me-2 text-success" /> {t("consumedCount")}
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/userDashBoard/mentalSupport" className="nav-link text-light opacity-85 rounded-3 py-2 px-3 d-flex align-items-center transition">
          <FaBrain className="me-2 text-warning" /> {t("mentalSupport")}
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/userDashBoard/profile" className="nav-link text-light opacity-85 rounded-3 py-2 px-3 d-flex align-items-center transition">
          <FaUser className="me-2 text-light" /> {t("profile")}
        </Link>
      </li>

      <li className="nav-item mt-2">
        <button
          className="btn btn-outline-info w-100 text-white text-start d-flex align-items-center gap-2 rounded-3 py-2"
          onClick={handleGenerateDoctorReport}
        >
          <FaFilePdf /> {t("downloadDoctorReport")}
        </button>
      </li>
      <li className="nav-item mt-1">
        <button
          className="btn btn-outline-success w-100 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 py-2"
          onClick={() => {
            setWhatsAppType("schedule");
            setWhatsAppAlertData({ medications: [] });
            setShowWhatsAppModal(true);
          }}
          title="Send medication schedules or alerts via WhatsApp & SMS"
        >
          <FaWhatsapp size={16} /> {t("whatsAppAlerts") || "WhatsApp Alerts"}
        </button>
      </li>
      {role === "patient" && (
        <li className="nav-item mt-2">
          <button
            className={`btn ${alertStatus ? "btn-secondary" : "btn-warning"} w-100 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 py-2`}
            disabled={alertStatus}
            onClick={handleAlert}
          >
            <FaBell /> {alertStatus ? t("alertSent") : t("sendAlert")}
          </button>
        </li>
      )}
      <li className="nav-item mt-auto pt-3">
        <button
          className="btn btn-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 shadow-sm"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> {t("logout")}
        </button>
      </li>
    </ul>
  </div>

  {/* Main Content */}
  <div
    className="flex-grow-1 p-3 p-md-4"
    style={{
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      paddingBottom: "85px",
    }}
  >
    {/* 🚨 Global Zero-Risk Expiry Conflict Banner */}
    {zeroRiskAlerts.length > 0 && (
      <div className="alert alert-danger shadow-sm border-0 border-start border-danger border-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 p-3 rounded-3">
        <div>
          <h6 className="fw-bold mb-1 text-danger">
            🚨 {t("zeroRiskAlert")}: Course Overruns Batch Expiry!
          </h6>
          <p className="mb-0 small text-dark">
            <strong>{zeroRiskAlerts.length}</strong> {t("zeroRiskDesc")}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0 ms-sm-3">
          <button
            className={`btn btn-sm text-nowrap fw-bold d-flex align-items-center gap-1 ${
              isVoiceAlertPlaying ? "btn-danger" : "btn-outline-danger"
            }`}
            onClick={handleToggleVoiceAlert}
            title={isVoiceAlertPlaying ? t("stopVoice") : t("voiceAlert")}
          >
            {isVoiceAlertPlaying ? <FaStop /> : <FaVolumeUp />}
            <span>{isVoiceAlertPlaying ? t("stopVoice") : t("voiceAlert")}</span>
          </button>
          <button
            className="btn btn-sm btn-outline-success fw-bold d-flex align-items-center gap-1 text-nowrap"
            onClick={() => {
              const firstAlert = zeroRiskAlerts[0] || {};
              setWhatsAppType("zeroRisk");
              setWhatsAppAlertData(firstAlert);
              setShowWhatsAppModal(true);
            }}
            title="Send hazard warning via WhatsApp to patient or family"
          >
            <FaWhatsapp /> <span>WhatsApp Alert</span>
          </button>
          <Link
            to="/userDashBoard/manageMedication"
            className="btn btn-danger btn-sm text-nowrap fw-bold"
          >
            {t("reviewAdjustDosage")}
          </Link>
        </div>
      </div>
    )}
    <Outlet />
  </div>

  {/* 📲 App-Style Mobile Bottom Navigation Bar */}
  <nav
    className="d-flex d-lg-none dashboard-mobile-bottom-nav justify-content-around align-items-center fixed-bottom px-1"
    style={{
      height: "64px",
      background: "linear-gradient(180deg, rgba(13, 11, 39, 0.98) 0%, rgba(7, 7, 22, 0.99) 100%)",
      backdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(255, 255, 255, 0.12)",
      boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.4)",
      zIndex: 1040,
    }}
  >
    {[
      { path: "/userDashBoard/manageMedication", altPath: "/userDashBoard", label: t("manageMedication")?.split(" ")[0] || "Meds", icon: FaPills },
      { path: "/userDashBoard/consumedChart", label: t("consumedChart")?.split(" ")[0] || "Chart", icon: FaChartLine },
      { path: "/userDashBoard/ConsumedCount", label: t("consumedCount")?.split(" ")[0] || "Count", icon: FaCheckCircle },
      { path: "/userDashBoard/mentalSupport", label: t("mentalSupport")?.split(" ")[0] || "Rings", icon: FaBrain },
      { path: "/userDashBoard/profile", label: t("profile") || "Profile", icon: FaUser },
    ].map((tab, idx) => {
      const isActive =
        location.pathname.toLowerCase() === tab.path.toLowerCase() ||
        (tab.altPath && location.pathname.toLowerCase() === tab.altPath.toLowerCase());
      const IconComp = tab.icon;
      return (
        <Link
          key={idx}
          to={tab.path}
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-decoration-none d-flex flex-column align-items-center justify-content-center py-1 px-2 flex-grow-1"
          style={{
            color: isActive ? "#00f5d4" : "#94a3b8",
            transition: "all 0.2s ease",
            position: "relative",
          }}
        >
          {isActive && (
            <span
              style={{
                position: "absolute",
                top: "2px",
                width: "22px",
                height: "3px",
                borderRadius: "2px",
                background: "#00f5d4",
                boxShadow: "0 0 8px #00f5d4",
              }}
            />
          )}
          <IconComp size={19} style={{ marginBottom: "2px", filter: isActive ? "drop-shadow(0 0 6px rgba(0,245,212,0.6))" : "none" }} />
          <span
            style={{
              fontSize: "11px",
              fontWeight: isActive ? "700" : "500",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
            }}
          >
            {tab.label}
          </span>
        </Link>
      );
    })}
  </nav>

  {/* 🚀 1-Tap Quick-Dose Floating Action Button for Patients */}
  {role === "patient" && <QuickDoseFAB />}

  {/* (Your Modals stay unchanged) */}
  {role === "caretaker" && showAlertModal && (
    <div className="modal show fade" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-warning">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">⚠️ {t("patientAlert")}</h5>
          </div>
          <div className="modal-body">
            <p>Your associate patient has triggered an alert! Please contact immediately.</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-success" onClick={handleClearAlert}>{t("confirm")}</button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* {showMissedModal && (
    <div className="modal show fade" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-danger">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">⚠️ Missed Medication Alert</h5>
          </div>
          <div className="modal-body">
            <p>The following tablets have not been taken on time:</p>
            <ul>
              {missedTablets.map((m, idx) => (
                <li key={idx}><strong>{m.tabletName}</strong> ({m.timing})</li>
              ))}
            </ul>
            <p className="text-danger fw-bold mb-0">Please take them immediately!</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowMissedModal(false)}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )} */}

  {showMissedModal && (
  <div
    className="modal show fade"
    style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content border-warning">
        <div className="modal-header bg-warning text-dark">
          <h5 className="modal-title">⏰ Reminder Medication Alert</h5>
        </div>
        <div className="modal-body">
          <p>The following tablets are pending for this time slot:</p>
          <ul>
            {missedTablets.map((m, idx) => (
              <li key={idx}>
                <strong>{m.tabletName}</strong> ({m.timing})
              </li>
            ))}
          </ul>
          <p className="text-danger fw-bold mb-0">
            Please take them as soon as possible!
          </p>
        </div>
        <div className="modal-footer d-flex justify-content-between">
          <button
            className="btn btn-success fw-bold d-flex align-items-center gap-2"
            onClick={() => {
              setWhatsAppType("missed");
              setWhatsAppAlertData({ tablets: missedTablets, slot: "Current Slot" });
              setShowWhatsAppModal(true);
            }}
          >
            <FaWhatsapp size={16} /> {t("sendWhatsAppAlert") || "Send via WhatsApp / SMS"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowMissedModal(false)}
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

  {/* 📲 WhatsApp & SMS Alert Dispatcher Modal */}
  <WhatsAppAlertModal
    show={showWhatsAppModal}
    onClose={() => setShowWhatsAppModal(false)}
    initialType={whatsAppType}
    alertData={whatsAppAlertData}
    patientName={name}
  />
</div>
  );
};

export default UserDashBoard;

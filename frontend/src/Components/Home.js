import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaLink,
  FaWhatsapp,
  FaCheckCircle,
  FaArrowRight,
  FaUserInjured,
  FaUserNurse,
  FaPrescriptionBottleAlt,
} from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [liveBlock, setLiveBlock] = useState(19482137);

  // Increment simulated block counter for live blockchain feel
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBlock((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleQuickLogin = (email, password) => {
    sessionStorage.setItem("demo_auto_email", email);
    sessionStorage.setItem("demo_auto_pass", password);
    navigate("/login");
  };

  return (
    <div className="bio-ambient-mesh min-vh-100 text-white position-relative overflow-hidden" style={{ color: "#f8fafc" }}>
      {/* Background Decorative Glowing Orbs */}
      <div
        className="position-absolute rounded-circle bio-glow-pulse"
        style={{
          width: "550px",
          height: "550px",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, transparent 70%)",
          top: "-150px",
          left: "5%",
          pointerEvents: "none",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />
      <div
        className="position-absolute rounded-circle bio-glow-pulse"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(0, 245, 212, 0.16) 0%, transparent 70%)",
          top: "35%",
          right: "-100px",
          pointerEvents: "none",
          filter: "blur(70px)",
          zIndex: 0,
        }}
      />

      {/* Floating Biotech Navbar (BioAge Labs Inspired) */}
      <header className="position-sticky top-0 w-100 py-3" style={{ zIndex: 1000, backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container d-flex justify-content-between align-items-center">
          {/* Logo */}
          <div className="d-flex align-items-center gap-3" role="button" onClick={() => navigate("/")}>
            <div
              className="d-flex align-items-center justify-content-center rounded-3 p-2"
              style={{
                background: "linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(139, 92, 246, 0.3))",
                border: "1px solid rgba(0, 245, 212, 0.4)",
                boxShadow: "0 0 20px rgba(0, 245, 212, 0.25)",
              }}
            >
              <FaShieldAlt className="text-info fs-5" />
            </div>
            <div>
              <span className="fs-4 fw-bold tracking-tight bio-heading text-white" style={{ letterSpacing: "-0.03em" }}>
                PHARMA<span style={{ color: "var(--bio-cyan)" }}>SURE</span>
              </span>
              <span className="badge ms-2 bio-pill-cyan" style={{ fontSize: "10px" }}>
                DSCSA 2.0
              </span>
            </div>
          </div>

          {/* Desktop Nav Pills */}
          <div className="d-none d-lg-flex align-items-center gap-4 small fw-semibold" style={{ color: "#e2e8f0" }}>
            <a href="#features" className="text-decoration-none text-light opacity-85 hover-opacity-100 transition">
              Clinical Platform
            </a>
            <a href="#floating-windows" className="text-decoration-none text-light opacity-85 hover-opacity-100 transition">
              Live Architecture
            </a>
            <a href="#quick-demo" className="text-decoration-none text-light opacity-85 hover-opacity-100 transition">
              Instant Roles
            </a>
            <div className="d-flex align-items-center gap-1 font-monospace text-light opacity-85">
              <span className="text-success">●</span> PoS #{liveBlock.toLocaleString()}
            </div>
          </div>

          {/* Right Actions */}
          <div className="d-flex align-items-center gap-3">
            <LanguageSelector variant="dark" />
            <button
              className="bio-btn-glow btn-sm"
              onClick={() => navigate("/login")}
            >
              <span>{t("login") || "Access Portal"}</span>
              <FaArrowRight size={12} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container pt-5 pb-4 position-relative" style={{ zIndex: 10 }}>
        <div className="text-center mx-auto" style={{ maxWidth: "860px" }}>
          {/* Eyebrow Pill */}
          <div className="d-inline-flex align-items-center mb-4">
            <span className="bio-pill bio-pill-violet shadow-sm">
              <span className="badge rounded-circle p-1 bg-success me-1"></span>
              FDA DSCSA Track & Trace • Polygon PoS Chain
            </span>
          </div>

          {/* Headline */}
          <h1
            className="display-4 fw-bolder mb-3 bio-heading"
            style={{
              lineHeight: 1.15,
              background: "linear-gradient(135deg, #ffffff 30%, #c0b3d0 75%, #00f5d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Zero-Risk Predictive Expiry & Decentralized Drug Provenance
          </h1>

          {/* Hero Subtitle - High Contrast Pure Legibility */}
          <p
            className="lead mb-4 fs-5 mx-auto"
            style={{
              color: "#e2e8f0",
              lineHeight: 1.65,
              maxWidth: "800px",
              fontWeight: 400,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            Eliminating clinical expiry hazards before dispensing occurs. Powered by mathematical course-inversion risk modeling, Gemini Multimodal vision, and immutable Polygon PoS blockchain serialization.
          </p>

          {/* Hero CTAs */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            <button
              className="bio-btn-glow fs-6 py-3 px-4 shadow-lg"
              onClick={() => navigate("/login")}
            >
              <span>Launch Clinical Workspace</span>
              <FaArrowRight />
            </button>
            <a
              href="#floating-windows"
              className="bio-btn-outline fs-6 py-3 px-4"
            >
              <span>Explore Live Dynamic Windows</span>
            </a>
          </div>

          {/* BioMetrics Strip */}
          <div className="row g-3 justify-content-center pt-2 pb-5 border-top border-bottom border-secondary border-opacity-25 my-4">
            <div className="col-6 col-md-3">
              <div className="fs-3 fw-bold bio-heading" style={{ color: "var(--bio-cyan)" }}>
                0.00%
              </div>
              <div className="small fw-semibold mt-1" style={{ color: "#cbd5e1" }}>
                Expired Dispense Rate
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-3 fw-bold bio-heading" style={{ color: "var(--bio-violet)" }}>
                64-Block
              </div>
              <div className="small fw-semibold mt-1" style={{ color: "#cbd5e1" }}>
                Polygon PoS Consensus
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-3 fw-bold bio-heading" style={{ color: "#38bdf8" }}>
                5 Regional
              </div>
              <div className="small fw-semibold mt-1" style={{ color: "#cbd5e1" }}>
                Languages & Voice Synthesis
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-3 fw-bold bio-heading" style={{ color: "var(--bio-emerald)" }}>
                &lt; 1.2s
              </div>
              <div className="small fw-semibold mt-1" style={{ color: "#cbd5e1" }}>
                AI Prescription Parsing
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 SIGNATURE SECTION: BIOAGE-INSPIRED DYNAMIC FLOATING WINDOWS */}
        <section id="floating-windows" className="py-5">
          <div className="text-center mb-5">
            <span className="bio-pill bio-pill-cyan mb-2">INTERACTIVE CLINICAL WINDOWS</span>
            <h2 className="fs-2 fw-bold bio-heading text-white">Dynamic System Architecture</h2>
            <p className="small mb-0" style={{ color: "#cbd5e1", fontSize: "14px" }}>
              Real-time modular interfaces driving Zero-Risk patient safety.
            </p>
          </div>

          <div className="row g-4 align-items-stretch">
            {/* FLOATING WINDOW 1: Zero-Risk Predictive Expiry Monitor */}
            <div className="col-lg-6">
              <div className="bio-floating-window bio-animate-float-1 h-100 p-0">
                {/* Window Header */}
                <div className="bio-window-bar">
                  <div className="bio-window-dots">
                    <span className="bio-window-dot bio-dot-red"></span>
                    <span className="bio-window-dot bio-dot-yellow"></span>
                    <span className="bio-window-dot bio-dot-green"></span>
                  </div>
                  <span className="font-mono small" style={{ fontSize: "11px", color: "#cbd5e1" }}>
                    predictive-risk-engine.sys
                  </span>
                  <span className="badge bio-pill-rose text-white" style={{ fontSize: "10px" }}>
                    Inversion Check
                  </span>
                </div>

                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="small text-uppercase font-mono" style={{ color: "#94a3b8", fontSize: "11px" }}>
                        Monitored Drug Entity
                      </span>
                      <h5 className="fw-bold mb-0 text-white">Amoxicillin 500mg (Course: 30 Days)</h5>
                    </div>
                    <span className="badge bg-danger bg-opacity-20 text-danger border border-danger px-2 py-1">
                      ⚠️ Hazard Flagged
                    </span>
                  </div>

                  {/* Mathematical Model Card */}
                  <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-3 font-mono small">
                    <div className="d-flex justify-content-between mb-1" style={{ color: "#e2e8f0" }}>
                      <span>Daily Dosing: 2 tabs/day</span>
                      <span>Stock: 60 tabs</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2" style={{ color: "#e2e8f0" }}>
                      <span>Course Runout Date:</span>
                      <strong className="text-danger">2027-02-15</strong>
                    </div>
                    <div className="d-flex justify-content-between border-top border-secondary border-opacity-25 pt-2" style={{ color: "#e2e8f0" }}>
                      <span>Batch Expiration Date:</span>
                      <strong className="text-warning">2026-11-20</strong>
                    </div>
                  </div>

                  {/* Timeline Progress Graphic */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1 font-mono" style={{ fontSize: "11px", color: "#cbd5e1" }}>
                      <span>Start: Today</span>
                      <span className="text-warning">Batch Expires (Day 20)</span>
                      <span className="text-danger">Patient Course Finishes (Day 30)</span>
                    </div>
                    <div className="progress" style={{ height: "8px", backgroundColor: "rgba(255,255,255,0.1)" }}>
                      <div className="progress-bar bg-success" style={{ width: "45%" }}></div>
                      <div className="progress-bar bg-warning" style={{ width: "20%" }}></div>
                      <div className="progress-bar bg-danger" style={{ width: "35%" }}></div>
                    </div>
                  </div>

                  <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border-opacity-25 p-2 small mb-0 text-white">
                    🛑 <strong>Zero-Risk Action:</strong> Prescription locked. System prevents patient from consuming expired medication during the final 10 days of treatment.
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING WINDOW 2: Blockchain Provenance Ledger */}
            <div className="col-lg-6">
              <div className="bio-floating-window bio-animate-float-2 h-100 p-0">
                {/* Window Header */}
                <div className="bio-window-bar">
                  <div className="bio-window-dots">
                    <span className="bio-window-dot bio-dot-red"></span>
                    <span className="bio-window-dot bio-dot-yellow"></span>
                    <span className="bio-window-dot bio-dot-green"></span>
                  </div>
                  <span className="font-mono small" style={{ fontSize: "11px", color: "#cbd5e1" }}>
                    polygon-amoy-pos.ledger
                  </span>
                  <span className="badge bio-pill-cyan text-white" style={{ fontSize: "10px" }}>
                    Chain ID 80002
                  </span>
                </div>

                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="small text-uppercase font-mono" style={{ color: "#94a3b8", fontSize: "11px" }}>
                        Consensus State
                      </span>
                      <h5 className="fw-bold mb-0 text-white">Decentralized Batch Registry</h5>
                    </div>
                    <span className="badge bg-success bg-opacity-20 text-success border border-success px-2 py-1">
                      <FaCheckCircle className="me-1" /> Block #{liveBlock.toLocaleString()}
                    </span>
                  </div>

                  {/* On-Chain Receipt Preview */}
                  <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-3 font-mono small">
                    <div className="mb-1" style={{ fontSize: "11px", color: "#cbd5e1" }}>
                      Transaction Hash (Keccak-256):
                    </div>
                    <code className="text-info d-block text-truncate mb-2" style={{ fontSize: "12px" }}>
                      0xe936c27a329f67a526f4cf42397e324150e14ec6207655168b99a1c46bb0a294
                    </code>

                    <div className="row g-2" style={{ fontSize: "12px", color: "#cbd5e1" }}>
                      <div className="col-6">
                        <span>Smart Contract:</span>
                        <div className="text-light fw-bold">0x89e2F7...5C41</div>
                      </div>
                      <div className="col-6">
                        <span>Genesis Seal:</span>
                        <div className="text-success fw-bold">Verified Tamper-Free</div>
                      </div>
                    </div>
                  </div>

                  <p className="small mb-3" style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
                    Every pharmaceutical lot is permanently inscribed at manufacture. Unauthorized date extensions or counterfeit batches immediately fail on-chain cryptographic comparison.
                  </p>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-info w-100 fw-bold d-flex align-items-center justify-content-center gap-1"
                      onClick={() => navigate("/login")}
                    >
                      <FaLink size={12} /> Inspect Full Ledger
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING WINDOW 3: Multimodal AI Prescription Scanner */}
            <div className="col-lg-6">
              <div className="bio-floating-window bio-animate-float-3 h-100 p-0">
                {/* Window Header */}
                <div className="bio-window-bar">
                  <div className="bio-window-dots">
                    <span className="bio-window-dot bio-dot-red"></span>
                    <span className="bio-window-dot bio-dot-yellow"></span>
                    <span className="bio-window-dot bio-dot-green"></span>
                  </div>
                  <span className="font-mono small" style={{ fontSize: "11px", color: "#cbd5e1" }}>
                    multimodal-vision-ocr.ai
                  </span>
                  <span className="badge bio-pill-violet text-white" style={{ fontSize: "10px" }}>
                    Gemini Vision
                  </span>
                </div>

                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="small text-uppercase font-mono" style={{ color: "#94a3b8", fontSize: "11px" }}>
                        Multimodal Deciphering
                      </span>
                      <h5 className="fw-bold mb-0 text-white">Handwritten Doctor Slip Parser</h5>
                    </div>
                    <span className="badge px-2 py-1 text-white" style={{ backgroundColor: "var(--bio-violet)" }}>
                      Neural OCR
                    </span>
                  </div>

                  {/* Handwriting to JSON Simulation */}
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="p-2 rounded-2 bg-dark bg-opacity-50 border border-secondary border-opacity-25 h-100">
                        <span className="font-mono" style={{ fontSize: "10px", color: "#94a3b8" }}>DOCTOR'S HANDWRITING:</span>
                        <div className="fst-italic text-warning pt-2" style={{ fontSize: "14px", fontFamily: "serif" }}>
                          "Tab Metformin 500mg 1-0-1 x 30d after food - Dr. Sharma"
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 rounded-2 bg-dark bg-opacity-50 border border-info border-opacity-25 h-100">
                        <span className="text-info font-mono" style={{ fontSize: "10px" }}>NORMALIZED SCHEDULE:</span>
                        <div className="text-light font-mono small pt-1">
                          • Drug: Metformin<br/>
                          • Dose: Morning + Night<br/>
                          • Qty: 60 Tabs
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="small mb-0" style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
                    Translates medical shorthand (<code className="text-info">OD</code>, <code className="text-info">BD</code>, <code className="text-info">1-0-1</code>, <code className="text-info">TDS</code>) directly into patient schedules with 1-tap bulk intake.
                  </p>
                </div>
              </div>
            </div>

            {/* FLOATING WINDOW 4: WhatsApp Adherence Dispatcher */}
            <div className="col-lg-6">
              <div className="bio-floating-window bio-animate-float-1 h-100 p-0">
                {/* Window Header */}
                <div className="bio-window-bar">
                  <div className="bio-window-dots">
                    <span className="bio-window-dot bio-dot-red"></span>
                    <span className="bio-window-dot bio-dot-yellow"></span>
                    <span className="bio-window-dot bio-dot-green"></span>
                  </div>
                  <span className="font-mono small" style={{ fontSize: "11px", color: "#cbd5e1" }}>
                    whatsapp-adherence-hub.msg
                  </span>
                  <span className="badge bio-pill-emerald text-white" style={{ fontSize: "10px" }}>
                    Cloud API
                  </span>
                </div>

                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="small text-uppercase font-mono" style={{ color: "#94a3b8", fontSize: "11px" }}>
                        Mobile Patient Gateway
                      </span>
                      <h5 className="fw-bold mb-0 text-white">Instant WhatsApp / SMS Dispatch</h5>
                    </div>
                    <span className="badge bg-success bg-opacity-20 text-success border border-success px-2 py-1">
                      <FaWhatsapp className="me-1" /> Active
                    </span>
                  </div>

                  {/* Mini WhatsApp Bubble */}
                  <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: "#0b141a", border: "1px solid rgba(37, 211, 102, 0.2)" }}>
                    <div className="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-secondary border-opacity-25">
                      <span className="badge bg-success rounded-circle p-1"></span>
                      <strong className="text-success small font-mono">PharmaSure Clinical Bot</strong>
                    </div>
                    <div className="p-2 rounded-2 text-white font-mono small" style={{ backgroundColor: "#005c4b", fontSize: "12px", lineHeight: "1.4" }}>
                      🚨 *CLINICAL ALERT*: Patient John has a pending *Morning* dose for *Atorvastatin 20mg*. Please take with water to maintain therapeutic levels.
                    </div>
                  </div>

                  <p className="small mb-0" style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
                    Bridges elderly patients and caretakers. Dispatches missed dose alerts, expiry hazards, and refill alerts directly to mobile devices without needing a computer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🚀 QUICK DEMO ROLE LAUNCHPAD */}
        <section id="quick-demo" className="py-5">
          <div className="bio-floating-window p-0 border-0 shadow-lg">
            {/* Window Header Bar */}
            <div className="bio-window-bar">
              <div className="bio-window-dots">
                <span className="bio-window-dot bio-dot-red"></span>
                <span className="bio-window-dot bio-dot-yellow"></span>
                <span className="bio-window-dot bio-dot-green"></span>
              </div>
              <span className="font-mono small" style={{ fontSize: "11px", color: "#cbd5e1" }}>
                fast-role-launchpad.exec
              </span>
              <span className="badge bio-pill-violet text-white" style={{ fontSize: "10px" }}>
                1-Click Fast Auth
              </span>
            </div>

            <div className="p-4 p-md-5">
              <div className="text-center mb-4">
                <span className="bio-pill bio-pill-violet mb-2">INSTANT ROLE ACCESS</span>
                <h3 className="fw-bold bio-heading text-white">Experience PharmaSure In Action</h3>
                <p className="small mx-auto" style={{ maxWidth: "600px", color: "#cbd5e1" }}>
                  Select a role below to automatically authenticate and explore the specialized interfaces engineered for patients, caretakers, and pharmacists.
                </p>
              </div>

              <div className="row g-3">
                {/* Patient Card */}
                <div className="col-md-4">
                  <div
                    className="p-4 rounded-3 h-100 d-flex flex-column justify-content-between bio-role-card"
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(0, 245, 212, 0.3)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleQuickLogin("harshithp914@gmail.com", "student123")}
                    role="button"
                  >
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span
                          className="p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ background: "rgba(0, 245, 212, 0.15)", color: "var(--bio-cyan)" }}
                        >
                          <FaUserInjured size={22} />
                        </span>
                        <span className="badge bio-pill-cyan">Patient Role</span>
                      </div>
                      <h5 className="fw-bold text-white mb-2">Patient Dashboard</h5>
                      <p className="small mb-3" style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
                        Track dosage schedules, adherence rings, zero-risk alerts, and 1-tap quick dose intake.
                      </p>
                    </div>
                    <button className="bio-btn-glow btn-sm w-100 mt-2 py-2">
                      <span>Enter as Patient</span>
                      <FaArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Caretaker Card */}
                <div className="col-md-4">
                  <div
                    className="p-4 rounded-3 h-100 d-flex flex-column justify-content-between bio-role-card"
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleQuickLogin("harshithp9141@gmail.com", "student123")}
                    role="button"
                  >
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span
                          className="p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--bio-amber)" }}
                        >
                          <FaUserNurse size={22} />
                        </span>
                        <span className="badge bio-pill-rose">Caretaker Role</span>
                      </div>
                      <h5 className="fw-bold text-white mb-2">Caretaker Terminal</h5>
                      <p className="small mb-3" style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
                        Monitor associated patients, review missed medication alerts, and dispatch WhatsApp alerts.
                      </p>
                    </div>
                    <button
                      className="bio-btn-outline btn-sm w-100 mt-2 py-2"
                      style={{ borderColor: "var(--bio-amber)", color: "var(--bio-amber)" }}
                    >
                      <span>Enter as Caretaker</span>
                      <FaArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Pharmacist / Admin Card */}
                <div className="col-md-4">
                  <div
                    className="p-4 rounded-3 h-100 d-flex flex-column justify-content-between bio-role-card"
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleQuickLogin("pharmacist@pharmasure.com", "admin123")}
                    role="button"
                  >
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span
                          className="p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--bio-emerald)" }}
                        >
                          <FaPrescriptionBottleAlt size={22} />
                        </span>
                        <span className="badge bio-pill-emerald">Pharmacist</span>
                      </div>
                      <h5 className="fw-bold text-white mb-2">Pharmacy Operations</h5>
                      <p className="small mb-3" style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
                        FEFO batch inventory, GS1 QR codes, Smart Dispense Assistant, and B2B distributor returns.
                      </p>
                    </div>
                    <button
                      className="bio-btn-outline btn-sm w-100 mt-2 py-2"
                      style={{ borderColor: "var(--bio-emerald)", color: "var(--bio-emerald)" }}
                    >
                      <span>Enter as Pharmacist</span>
                      <FaArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

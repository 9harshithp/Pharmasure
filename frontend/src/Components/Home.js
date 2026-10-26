import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
          background: "radial-gradient(circle, rgba(0, 242, 255, 0.2) 0%, transparent 70%)",
          top: "-150px",
          left: "5%",
          pointerEvents: "none",
          filter: "blur(70px)",
          zIndex: 0,
        }}
      />
      <div
        className="position-absolute rounded-circle bio-glow-pulse"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(255, 103, 50, 0.16) 0%, transparent 70%)",
          top: "35%",
          right: "-100px",
          pointerEvents: "none",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />
      <div
        className="position-absolute rounded-circle"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(255, 202, 0, 0.12) 0%, transparent 70%)",
          top: "65%",
          left: "20%",
          pointerEvents: "none",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />

      {/* Floating Modern Healthcare Navbar */}
      <header className="position-sticky top-0 w-100 py-3" style={{ zIndex: 1000, backdropFilter: "blur(20px)", borderBottom: "1px solid #E2E8F0", background: "rgba(255, 255, 255, 0.9)" }}>
        <div className="container d-flex justify-content-between align-items-center">
          {/* Logo */}
          <div className="d-flex align-items-center gap-2" role="button" onClick={() => navigate("/")}>
            <picture>
              <source srcSet="/pharmasure-logo-full.webp" type="image/webp" />
              <img
                src="/pharmasure-logo-full.png"
                alt="PharmaSure: Predictive Expiry & Decentralized Provenance"
                width="110"
                height="44"
                fetchPriority="high"
                style={{ height: "44px", width: "auto", objectFit: "contain" }}
              />
            </picture>
            <span className="badge bio-pill-cyan d-none d-sm-inline-block ms-1" style={{ fontSize: "10px" }}>
              DSCSA 2.0
            </span>
          </div>

          {/* Desktop Nav Pills */}
          <div className="d-none d-lg-flex align-items-center gap-4 small fw-semibold">
            <a href="#features" className="text-decoration-none transition fw-semibold" style={{ color: "#0F2942" }}>
              Clinical Platform
            </a>
            <a href="#floating-windows" className="text-decoration-none transition fw-semibold" style={{ color: "#0F2942" }}>
              Live Architecture
            </a>
            <a href="#quick-demo" className="text-decoration-none transition fw-semibold" style={{ color: "#0F2942" }}>
              Instant Roles
            </a>
            <div className="d-flex align-items-center gap-1 font-monospace fw-semibold" style={{ color: "#0F2942" }}>
              <span style={{ color: "#06B6D4" }}>●</span> PoS #{liveBlock.toLocaleString()}
            </div>
          </div>

          {/* Right Actions */}
          <div className="d-flex align-items-center gap-3">
            <LanguageSelector variant="light" />
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
            <span className="bio-pill bio-pill-cyan shadow-sm">
              <span className="badge rounded-circle p-1 bg-success me-1"></span>
              FDA DSCSA Track & Trace • Polygon PoS Chain
            </span>
          </div>

          {/* Headline */}
          <h1
            className="display-4 fw-bolder mb-3 bio-heading"
            style={{
              lineHeight: 1.15,
              color: "#0F2942",
              letterSpacing: "-0.03em",
            }}
          >
            Zero-Risk Predictive Expiry & <span style={{ color: "#06B6D4" }}>Decentralized Drug Provenance</span>
          </h1>

          {/* Hero Subtitle */}
          <p
            className="lead mb-4 fs-5 mx-auto"
            style={{
              color: "#475569",
              lineHeight: 1.65,
              maxWidth: "800px",
              fontWeight: 400,
            }}
          >
            Eliminating clinical expiry hazards before dispensing occurs. Powered by mathematical course-inversion risk modeling, Gemini Multimodal vision, and immutable Polygon PoS blockchain serialization.
          </p>

          {/* Hero CTAs */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            <button
              className="bio-btn-glow fs-6 py-3 px-4 shadow-sm"
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
          <div className="row g-3 justify-content-center pt-2 pb-5 border-top border-bottom my-4" style={{ borderColor: "#E2E8F0" }}>
            <div className="col-6 col-md-3">
              <div className="fs-3 fw-bold bio-heading" style={{ color: "#06B6D4" }}>
                0.00%
              </div>
              <div className="small fw-semibold mt-1" style={{ color: "#64748B" }}>
                Expired Dispense Rate
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-3 fw-bold bio-heading" style={{ color: "#0F2942" }}>
                64-Block
              </div>
              <div className="small fw-semibold mt-1" style={{ color: "#64748B" }}>
                Polygon PoS Consensus
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-3 fw-bold bio-heading" style={{ color: "#EA580C" }}>
                5 Regional
              </div>
              <div className="small fw-semibold mt-1" style={{ color: "#64748B" }}>
                Languages & Voice Synthesis
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="fs-3 fw-bold bio-heading" style={{ color: "#0D9488" }}>
                &lt; 1.2s
              </div>
              <div className="small fw-semibold mt-1" style={{ color: "#64748B" }}>
                AI Prescription Parsing
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 SIGNATURE SECTION: DYNAMIC SYSTEM ARCHITECTURE */}
        <section id="floating-windows" className="py-5">
          <div className="text-center mb-5">
            <span className="bio-pill bio-pill-cyan mb-2">INTERACTIVE CLINICAL WINDOWS</span>
            <h2 className="fs-2 fw-bold bio-heading" style={{ color: "#0F2942" }}>Dynamic System Architecture</h2>
            <p className="small mb-0" style={{ color: "#64748B", fontSize: "14px" }}>
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
                  <span className="font-mono small" style={{ fontSize: "11px", color: "#64748B" }}>
                    predictive-risk-engine.sys
                  </span>
                  <span className="badge bio-pill-rose" style={{ fontSize: "10px" }}>
                    Inversion Check
                  </span>
                </div>

                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="small text-uppercase font-mono" style={{ color: "#64748B", fontSize: "11px" }}>
                        Monitored Drug Entity
                      </span>
                      <h3 className="h5 fw-bold mb-0" style={{ color: "#0F2942" }}>Amoxicillin 500mg (Course: 30 Days)</h3>
                    </div>
                    <span
                      className="badge px-2 py-1"
                      style={{
                        backgroundColor: "#FEF2F2",
                        color: "#991B1B",
                        border: "1px solid #FECACA",
                      }}
                    >
                      ⚠️ Hazard Flagged
                    </span>
                  </div>

                  {/* Mathematical Model Card */}
                  <div className="p-3 rounded-3 mb-3 font-mono small" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <div className="d-flex justify-content-between mb-1" style={{ color: "#0F2942" }}>
                      <span>Daily Dosing: 2 tabs/day</span>
                      <span>Stock: 60 tabs</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2" style={{ color: "#0F2942" }}>
                      <span>Course Runout Date:</span>
                      <strong style={{ color: "#991B1B" }}>2027-02-15</strong>
                    </div>
                    <div className="d-flex justify-content-between border-top pt-2" style={{ borderColor: "#E2E8F0", color: "#0F2942" }}>
                      <span>Batch Expiration Date:</span>
                      <strong style={{ color: "#92400E" }}>2026-11-20</strong>
                    </div>
                  </div>

                  {/* Timeline Progress Graphic */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1 font-mono" style={{ fontSize: "11px", color: "#64748B" }}>
                      <span>Start: Today</span>
                      <span style={{ color: "#92400E" }}>Batch Expires (Day 20)</span>
                      <span style={{ color: "#991B1B" }}>Patient Finishes (Day 30)</span>
                    </div>
                    <div className="progress" style={{ height: "8px", backgroundColor: "#E2E8F0" }}>
                      <div className="progress-bar bg-success" style={{ width: "45%" }}></div>
                      <div className="progress-bar bg-warning" style={{ width: "20%" }}></div>
                      <div className="progress-bar bg-danger" style={{ width: "35%" }}></div>
                    </div>
                  </div>

                  <div className="p-3 rounded-3 small mb-0" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B" }}>
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
                  <span className="font-mono small" style={{ fontSize: "11px", color: "#64748B" }}>
                    polygon-amoy-pos.ledger
                  </span>
                  <span className="badge bio-pill-cyan" style={{ fontSize: "10px" }}>
                    Chain ID 80002
                  </span>
                </div>

                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="small text-uppercase font-mono" style={{ color: "#64748B", fontSize: "11px" }}>
                        Consensus State
                      </span>
                      <h3 className="h5 fw-bold mb-0" style={{ color: "#0F2942" }}>Decentralized Batch Registry</h3>
                    </div>
                    <span
                      className="badge px-2 py-1"
                      style={{
                        backgroundColor: "#F0FDF4",
                        color: "#166534",
                        border: "1px solid #BBF7D0",
                      }}
                    >
                      <FaCheckCircle className="me-1" /> Block #{liveBlock.toLocaleString()}
                    </span>
                  </div>

                  {/* On-Chain Receipt Preview */}
                  <div className="p-3 rounded-3 mb-3 font-mono small" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <div className="mb-1" style={{ fontSize: "11px", color: "#64748B" }}>
                      Transaction Hash (Keccak-256):
                    </div>
                    <code className="d-block text-truncate mb-2" style={{ fontSize: "12px", color: "#155E75" }}>
                      0xe936c27a329f67a526f4cf42397e324150e14ec6207655168b99a1c46bb0a294
                    </code>

                    <div className="row g-2" style={{ fontSize: "12px", color: "#64748B" }}>
                      <div className="col-6">
                        <span>Smart Contract:</span>
                        <div className="fw-bold" style={{ color: "#0F2942" }}>0x89e2F7...5C41</div>
                      </div>
                      <div className="col-6">
                        <span>Genesis Seal:</span>
                        <div className="fw-bold" style={{ color: "#166534" }}>Verified Tamper-Free</div>
                      </div>
                    </div>
                  </div>

                  <p className="small mb-3" style={{ color: "#64748B", lineHeight: 1.5 }}>
                    Every pharmaceutical lot is permanently inscribed at manufacture. Unauthorized date extensions or counterfeit batches immediately fail on-chain cryptographic comparison.
                  </p>

                  <div className="d-flex gap-2">
                    <button
                      className="bio-btn-outline w-100 justify-content-center py-2"
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
                  <span className="font-mono small" style={{ fontSize: "11px", color: "#64748B" }}>
                    multimodal-vision-ocr.ai
                  </span>
                  <span className="badge bio-pill-gold" style={{ fontSize: "10px" }}>
                    Gemini Vision
                  </span>
                </div>

                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="small text-uppercase font-mono" style={{ color: "#64748B", fontSize: "11px" }}>
                        Multimodal Deciphering
                      </span>
                      <h3 className="h5 fw-bold mb-0" style={{ color: "#0F2942" }}>Handwritten Doctor Slip Parser</h3>
                    </div>
                    <span className="badge px-2 py-1" style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" }}>
                      Neural OCR
                    </span>
                  </div>

                  {/* Handwriting to JSON Simulation */}
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="p-2 rounded-2 h-100" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                        <span className="font-mono" style={{ fontSize: "10px", color: "#92400E" }}>DOCTOR'S HANDWRITING:</span>
                        <div className="fst-italic pt-2" style={{ fontSize: "13px", fontFamily: "serif", color: "#78350F" }}>
                          "Tab Metformin 500mg 1-0-1 x 30d after food - Dr. Sharma"
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 rounded-2 h-100" style={{ background: "#F0FDFA", border: "1px solid #99F6E4" }}>
                        <span className="font-mono" style={{ fontSize: "10px", color: "#0F766E" }}>NORMALIZED SCHEDULE:</span>
                        <div className="font-mono small pt-1" style={{ color: "#115E59", fontSize: "12px" }}>
                          • Drug: Metformin<br/>
                          • Dose: Morning + Night<br/>
                          • Qty: 60 Tabs
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="small mb-0" style={{ color: "#64748B", lineHeight: 1.5 }}>
                    Translates medical shorthand (<code style={{ color: "#1D4ED8" }}>OD</code>, <code style={{ color: "#1D4ED8" }}>BD</code>, <code style={{ color: "#1D4ED8" }}>1-0-1</code>, <code style={{ color: "#1D4ED8" }}>TDS</code>) directly into patient schedules with 1-tap bulk intake.
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
                  <span className="font-mono small" style={{ fontSize: "11px", color: "#64748B" }}>
                    whatsapp-adherence-hub.msg
                  </span>
                  <span className="badge bio-pill-emerald" style={{ fontSize: "10px" }}>
                    Cloud API
                  </span>
                </div>

                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="small text-uppercase font-mono" style={{ color: "#64748B", fontSize: "11px" }}>
                        Mobile Patient Gateway
                      </span>
                      <h3 className="h5 fw-bold mb-0" style={{ color: "#0F2942" }}>Instant WhatsApp / SMS Dispatch</h3>
                    </div>
                    <span
                      className="badge px-2 py-1"
                      style={{
                        backgroundColor: "#F0FDF4",
                        color: "#166534",
                        border: "1px solid #BBF7D0",
                      }}
                    >
                      <FaWhatsapp className="me-1" /> Active
                    </span>
                  </div>

                  {/* Mini WhatsApp Bubble */}
                  <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: "#EFEAE2", border: "1px solid #CBD5E1" }}>
                    <div className="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom" style={{ borderColor: "#CBD5E1" }}>
                      <span className="badge bg-success rounded-circle p-1"></span>
                      <strong className="small font-mono" style={{ color: "#075E54" }}>PharmaSure Clinical Bot</strong>
                    </div>
                    <div className="p-2 rounded-2 font-mono small shadow-sm" style={{ backgroundColor: "#DCF8C6", fontSize: "12px", lineHeight: "1.4", color: "#064E3B" }}>
                      🚨 *CLINICAL ALERT*: Patient John has a pending *Morning* dose for *Atorvastatin 20mg*. Please take with water to maintain therapeutic levels.
                    </div>
                  </div>

                  <p className="small mb-0" style={{ color: "#64748B", lineHeight: 1.5 }}>
                    Bridges elderly patients and caretakers. Dispatches missed dose alerts, expiry hazards, and refill alerts directly to mobile devices without needing a computer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🚀 QUICK DEMO ROLE LAUNCHPAD */}
        <section id="quick-demo" className="py-5">
          <div className="bio-floating-window p-0 border-0 shadow-sm">
            {/* Window Header Bar */}
            <div className="bio-window-bar">
              <div className="bio-window-dots">
                <span className="bio-window-dot bio-dot-red"></span>
                <span className="bio-window-dot bio-dot-yellow"></span>
                <span className="bio-window-dot bio-dot-green"></span>
              </div>
              <span className="font-mono small" style={{ fontSize: "11px", color: "#64748B" }}>
                fast-role-launchpad.exec
              </span>
              <span className="badge bio-pill-cyan" style={{ fontSize: "10px" }}>
                1-Click Fast Auth
              </span>
            </div>

            <div className="p-4 p-md-5">
              <div className="text-center mb-4">
                <span className="bio-pill bio-pill-cyan mb-2">INSTANT ROLE ACCESS</span>
                <h2 className="fs-2 fw-bold bio-heading" style={{ color: "#0F2942" }}>Experience PharmaSure In Action</h2>
                <p className="small mx-auto" style={{ maxWidth: "600px", color: "#64748B" }}>
                  Select a role below to automatically authenticate and explore the specialized interfaces engineered for patients, caretakers, and pharmacists.
                </p>
              </div>

              <div className="row g-3">
                {/* Patient Card */}
                <div className="col-md-4">
                  <div
                    className="p-4 rounded-3 h-100 d-flex flex-column justify-content-between bio-role-card"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #06B6D4",
                      boxShadow: "0 4px 16px rgba(6, 182, 212, 0.08)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleQuickLogin("harshithp914@gmail.com", "student123")}
                    role="button"
                  >
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span
                          className="p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ background: "rgba(6, 182, 212, 0.12)", color: "#06B6D4" }}
                        >
                          <FaUserInjured size={22} />
                        </span>
                        <span className="badge bio-pill-cyan">Patient Role</span>
                      </div>
                      <h3 className="h5 fw-bold mb-2" style={{ color: "#0F2942" }}>Patient Dashboard</h3>
                      <p className="small mb-3" style={{ color: "#64748B", lineHeight: 1.5 }}>
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
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 12px rgba(15, 41, 66, 0.04)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleQuickLogin("harshithp9141@gmail.com", "student123")}
                    role="button"
                  >
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span
                          className="p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ background: "rgba(234, 88, 12, 0.12)", color: "#EA580C" }}
                        >
                          <FaUserNurse size={22} />
                        </span>
                        <span className="badge bio-pill-orange">Caretaker Role</span>
                      </div>
                      <h3 className="h5 fw-bold mb-2" style={{ color: "#0F2942" }}>Caretaker Terminal</h3>
                      <p className="small mb-3" style={{ color: "#64748B", lineHeight: 1.5 }}>
                        Monitor associated patients, review missed medication alerts, and dispatch WhatsApp alerts.
                      </p>
                    </div>
                    <button className="bio-btn-outline btn-sm w-100 mt-2 py-2">
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
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 12px rgba(15, 41, 66, 0.04)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleQuickLogin("pharmacist@pharmasure.com", "admin123")}
                    role="button"
                  >
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span
                          className="p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ background: "rgba(13, 148, 136, 0.12)", color: "#0D9488" }}
                        >
                          <FaPrescriptionBottleAlt size={22} />
                        </span>
                        <span className="badge bio-pill-emerald">Pharmacist</span>
                      </div>
                      <h3 className="h5 fw-bold mb-2" style={{ color: "#0F2942" }}>Pharmacy Operations</h3>
                      <p className="small mb-3" style={{ color: "#64748B", lineHeight: 1.5 }}>
                        FEFO batch inventory, GS1 QR codes, Smart Dispense Assistant, and B2B distributor returns.
                      </p>
                    </div>
                    <button className="bio-btn-outline btn-sm w-100 mt-2 py-2">
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

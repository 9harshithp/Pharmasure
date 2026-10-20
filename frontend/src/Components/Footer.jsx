import React from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaArrowUp,
  FaExternalLinkAlt,
  FaLock,
} from "react-icons/fa";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="bio-footer position-relative mt-auto"
      style={{
        background: "linear-gradient(180deg, rgba(7, 7, 22, 0.92) 0%, #04040d 100%)",
        borderTop: "1px solid rgba(139, 92, 246, 0.25)",
        boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.6)",
        zIndex: 20,
        color: "#cbd5e1",
      }}
    >
      {/* Ambient Gradient Glow Line on Top */}
      <div
        style={{
          height: "2px",
          width: "100%",
          background: "linear-gradient(90deg, transparent 0%, #00f5d4 30%, #8b5cf6 70%, transparent 100%)",
          opacity: 0.8,
        }}
      />

      <div className="container py-5">
        <div className="row g-4 justify-content-between">
          {/* Column 1: Brand & Mission */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "linear-gradient(135deg, #00f5d4 0%, #8b5cf6 100%)",
                  color: "#070716",
                  boxShadow: "0 0 15px rgba(0, 245, 212, 0.4)",
                }}
              >
                <FaShieldAlt size={18} />
              </span>
              <span className="fs-4 fw-bold tracking-tight text-white font-heading">
                PHARMA<span style={{ color: "var(--bio-cyan)" }}>SURE</span>
              </span>
              <span className="badge bio-pill-cyan ms-1" style={{ fontSize: "10px" }}>
                DSCSA 2.0
              </span>
            </div>

            <p className="small mb-3" style={{ color: "#94a3b8", lineHeight: 1.6, maxWidth: "340px" }}>
              Decentralized Predictive Expiry Management & Multimodal Clinical Slip Parsing. Engineered to eliminate medication expiry hazards prior to dispensing with zero-risk mathematical course-inversion.
            </p>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <span
                className="badge px-2 py-1 font-mono text-success d-inline-flex align-items-center gap-1"
                style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", fontSize: "11px" }}
              >
                <span className="rounded-circle bg-success" style={{ width: "6px", height: "6px", display: "inline-block" }}></span>
                Polygon Amoy #80002
              </span>
              <span
                className="badge px-2 py-1 font-mono text-info d-inline-flex align-items-center gap-1"
                style={{ background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", fontSize: "11px" }}
              >
                <FaLock size={9} />
                21 CFR Part 11
              </span>
            </div>
          </div>

          {/* Column 2: Clinical Modules */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold text-uppercase font-mono mb-3" style={{ fontSize: "12px", letterSpacing: "0.08em" }}>
              Clinical Modules
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/#floating-windows" className="text-decoration-none transition" style={{ color: "#cbd5e1" }}>
                  Zero-Risk Inversion Engine
                </Link>
              </li>
              <li>
                <a
                  href="https://amoy.polygonscan.com/address/0x89e2F79C64f028827931390d4076e01a884E5C41"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none transition d-flex align-items-center gap-1"
                  style={{ color: "#cbd5e1" }}
                >
                  <span>Polygon PoS Provenance</span>
                  <FaExternalLinkAlt size={10} style={{ opacity: 0.6 }} />
                </a>
              </li>
              <li>
                <Link to="/userDashboard" className="text-decoration-none transition" style={{ color: "#cbd5e1" }}>
                  Gemini Prescription OCR
                </Link>
              </li>
              <li>
                <Link to="/userDashboard" className="text-decoration-none transition" style={{ color: "#cbd5e1" }}>
                  WhatsApp Dispatch Hub
                </Link>
              </li>
              <li>
                <Link to="/userDashboard/mentalSupport" className="text-decoration-none transition" style={{ color: "#cbd5e1" }}>
                  Adherence & Wellness Rings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Fast Role Access */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="text-white fw-bold text-uppercase font-mono mb-3" style={{ fontSize: "12px", letterSpacing: "0.08em" }}>
              Direct Portals
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/login" className="text-decoration-none transition d-flex align-items-center gap-2" style={{ color: "#cbd5e1" }}>
                  <span className="rounded-circle bg-primary" style={{ width: "6px", height: "6px" }}></span>
                  Patient Safety Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-decoration-none transition d-flex align-items-center gap-2" style={{ color: "#cbd5e1" }}>
                  <span className="rounded-circle bg-warning" style={{ width: "6px", height: "6px" }}></span>
                  Caretaker Remote Gateway
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-decoration-none transition d-flex align-items-center gap-2" style={{ color: "#cbd5e1" }}>
                  <span className="rounded-circle bg-success" style={{ width: "6px", height: "6px" }}></span>
                  Pharmacist FEFO Operations
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-decoration-none transition d-flex align-items-center gap-2" style={{ color: "#cbd5e1" }}>
                  <span className="rounded-circle bg-info" style={{ width: "6px", height: "6px" }}></span>
                  Clinical Inventory Analytics
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-decoration-none transition text-info fw-semibold" style={{ fontSize: "12px" }}>
                  + Create New Clinical Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Contract Ledger */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold text-uppercase font-mono mb-3" style={{ fontSize: "12px", letterSpacing: "0.08em" }}>
              Compliance & Ledger
            </h6>
            <div
              className="p-3 rounded-3 mb-3 font-mono"
              style={{
                background: "rgba(18, 16, 44, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontSize: "11px",
              }}
            >
              <div className="d-flex justify-content-between mb-1" style={{ color: "#94a3b8" }}>
                <span>NETWORK:</span>
                <span className="text-white">Polygon Amoy PoS</span>
              </div>
              <div className="d-flex justify-content-between mb-1" style={{ color: "#94a3b8" }}>
                <span>CHAIN ID:</span>
                <span className="text-white">80002</span>
              </div>
              <div className="d-flex justify-content-between border-top border-secondary border-opacity-25 pt-1" style={{ color: "#94a3b8" }}>
                <span>CONTRACT:</span>
                <a
                  href="https://amoy.polygonscan.com/address/0x89e2F79C64f028827931390d4076e01a884E5C41"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-info text-decoration-none font-mono"
                >
                  0x89e2...5C41 ↗
                </a>
              </div>
            </div>
            <p className="small mb-0" style={{ color: "#94a3b8", fontSize: "11px", lineHeight: 1.5 }}>
              Meets FDA Drug Supply Chain Security Act (DSCSA) 2024 standards for electronic serialized drug provenance and zero-risk patient dispensing.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-4 mt-4 border-top border-secondary border-opacity-25 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <div className="small font-mono text-center text-sm-start" style={{ color: "#94a3b8", fontSize: "12px" }}>
            <span>© 2026 PharmaSure System Inc. All clinical data protected under HIPAA & DSCSA 2.0 standards.</span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button
              onClick={scrollToTop}
              className="btn btn-sm text-white d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                fontSize: "11px",
                transition: "all 0.2s ease",
              }}
              title="Back to Top"
            >
              <span>Back to Top</span>
              <FaArrowUp size={10} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import { Link } from "react-router-dom";
import {
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
        background: "#0F2942",
        borderTop: "3px solid #06B6D4",
        boxShadow: "0 -8px 30px rgba(15, 41, 66, 0.15)",
        zIndex: 20,
        color: "#CBD5E1",
      }}
    >
      {/* 📱 MOBILE COMPACT FOOTER (Ultra-slim, clean essentials) */}
      <div
        className="mobile-footer-compact d-block d-lg-none py-2 px-3 text-center"
        style={{
          background: "#081b2e",
          borderTop: "1px solid rgba(6, 182, 212, 0.3)",
          paddingBottom: "80px",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-1">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-white rounded-2 px-2 py-0.5 d-inline-flex align-items-center shadow-sm">
              <img
                src="/pharmasure-logo-full.png"
                alt="PharmaSure"
                width="60"
                height="20"
                style={{ height: "20px", width: "auto", objectFit: "contain" }}
              />
            </div>
            <span
              className="badge"
              style={{
                fontSize: "9px",
                background: "rgba(6, 182, 212, 0.2)",
                color: "#67E8F9",
              }}
            >
              DSCSA 2.0
            </span>
          </div>

          <button
            onClick={scrollToTop}
            className="btn btn-sm text-white d-inline-flex align-items-center gap-1 px-2 py-0.5 rounded-pill"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: "10px",
            }}
          >
            <span>Top</span>
            <FaArrowUp size={8} />
          </button>
        </div>

        <div className="text-muted" style={{ fontSize: "10px" }}>
          © 2026 PharmaSure • Zero-Risk Dispensing • HIPAA & DSCSA Compliant
        </div>
      </div>

      {/* 💻 DESKTOP FULL FOOTER */}
      <div className="desktop-footer-columns d-none d-lg-block container py-5">
        <div className="row g-4 justify-content-between">
          {/* Column 1: Brand & Mission */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="bg-white rounded-3 px-2 py-1.5 d-inline-flex align-items-center"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
              >
                <picture>
                  <source srcSet="/pharmasure-logo-full.webp" type="image/webp" />
                  <img
                    src="/pharmasure-logo-full.png"
                    alt="PharmaSure"
                    width="80"
                    height="32"
                    loading="lazy"
                    style={{ height: "32px", width: "auto", objectFit: "contain" }}
                  />
                </picture>
              </div>
              <span
                className="badge ms-1"
                style={{
                  fontSize: "10px",
                  background: "rgba(6, 182, 212, 0.2)",
                  border: "1px solid rgba(6, 182, 212, 0.4)",
                  color: "#67E8F9",
                }}
              >
                DSCSA 2.0
              </span>
            </div>

            <p className="small mb-3" style={{ color: "#94a3b8", lineHeight: 1.6, maxWidth: "340px" }}>
              Decentralized Predictive Expiry Management & Multimodal Clinical Slip Parsing. Engineered to eliminate medication expiry hazards prior to dispensing with zero-risk mathematical course-inversion.
            </p>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <span
                className="badge px-2 py-1 font-mono d-inline-flex align-items-center gap-1"
                style={{ background: "rgba(0, 242, 255, 0.12)", border: "1px solid rgba(0, 242, 255, 0.35)", color: "#00F2FF", fontSize: "11px" }}
              >
                <span className="rounded-circle" style={{ width: "6px", height: "6px", display: "inline-block", background: "#00F2FF" }}></span>
                Polygon Amoy #80002
              </span>
              <span
                className="badge px-2 py-1 font-mono d-inline-flex align-items-center gap-1"
                style={{ background: "rgba(255, 202, 0, 0.12)", border: "1px solid rgba(255, 202, 0, 0.35)", color: "#FFCA00", fontSize: "11px" }}
              >
                <FaLock size={9} />
                21 CFR Part 11
              </span>
            </div>
          </div>

          {/* Column 2: Clinical Modules */}
          <div className="col-lg-2 col-md-6 col-6">
            <h3 className="h6 text-white fw-bold text-uppercase font-mono mb-3" style={{ fontSize: "12px", letterSpacing: "0.08em" }}>
              Clinical Modules
            </h3>
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
            <h3 className="h6 text-white fw-bold text-uppercase font-mono mb-3" style={{ fontSize: "12px", letterSpacing: "0.08em" }}>
              Direct Portals
            </h3>
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
            <h3 className="h6 text-white fw-bold text-uppercase font-mono mb-3" style={{ fontSize: "12px", letterSpacing: "0.08em" }}>
              Compliance & Ledger
            </h3>
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

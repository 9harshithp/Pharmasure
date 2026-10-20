import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  FaBoxes,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";

const PharmaDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("Logged out successfully!", { position: "top-center" });
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div
      className="d-flex flex-column flex-md-row"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <ToastContainer position="top-center" autoClose={2000} />

      {/* Mobile Navbar */}
      <nav className="navbar navbar-dark bg-dark d-md-none">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <span className="navbar-brand fw-bold mb-0">💊 {t("appName")}</span>
          <div className="d-flex align-items-center gap-2">
            <LanguageSelector variant="dark" />
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#pharmaMobileMenu"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
        <div className="collapse" id="pharmaMobileMenu">
          <ul className="navbar-nav text-start bg-dark p-3">
            <li className="nav-item mb-2">
              <Link to="/pharmaDashBoard/inventory" className="nav-link text-white">
                <FaBoxes className="me-2 text-primary" /> {t("inventory")}
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/pharmaDashBoard/analytics" className="nav-link text-white">
                <FaChartBar className="me-2 text-info" /> {t("analytics")}
              </Link>
            </li>
            <li className="nav-item mt-3">
              <button
                className="btn btn-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                onClick={handleLogout}
              >
                <FaSignOutAlt /> {t("logout")}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <div
        className="d-none d-md-flex flex-column p-3 text-white"
        style={{
          width: "270px",
          minHeight: "100vh",
          background: "linear-gradient(180deg, #09081e 0%, #0d0b27 50%, #070716 100%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "4px 0 25px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Brand Logo */}
        <div className="d-flex align-items-center gap-2 justify-content-center mb-3 pt-2" role="button" onClick={() => navigate("/")}>
          <div
            className="p-2 rounded-3 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(0, 245, 212, 0.15)", border: "1px solid rgba(0, 245, 212, 0.3)" }}
          >
            <span className="fs-5">💊</span>
          </div>
          <h4 className="mb-0 fw-bold bio-heading text-white" style={{ letterSpacing: "-0.02em" }}>
            PHARMA<span style={{ color: "var(--bio-cyan)" }}>SURE</span>
          </h4>
        </div>
        
        {/* Language Selector */}
        <div className="mb-4 text-center">
          <LanguageSelector variant="dark" />
        </div>

        <ul className="nav flex-column gap-2">
          <li className="nav-item">
            <Link to="/pharmaDashBoard/inventory" className="nav-link text-white rounded-3 py-2 px-3 d-flex align-items-center transition" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
              <FaBoxes className="me-2 text-info" /> {t("inventory")}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/pharmaDashBoard/analytics" className="nav-link text-light opacity-85 rounded-3 py-2 px-3 d-flex align-items-center transition">
              <FaChartBar className="me-2 text-primary" /> {t("analytics")}
            </Link>
          </li>
        </ul>
        <button
          className="btn btn-danger mt-auto fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 shadow-sm"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> {t("logout")}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 p-3">
        <Outlet />
      </div>
    </div>
  );
};

export default PharmaDashboard;

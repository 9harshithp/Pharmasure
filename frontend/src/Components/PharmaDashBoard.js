import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { t } = useLanguage();

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("Logged out successfully!", { position: "top-center" });
    setTimeout(() => navigate("/login"), 1500);
  };

  const isAnalytics = location.pathname.includes("/analytics");
  const isInventory = !isAnalytics;

  return (
    <div
      className="d-flex flex-column flex-md-row"
      style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}
    >
      <ToastContainer position="top-center" autoClose={2000} />

      {/* Mobile Navbar */}
      <nav className="navbar navbar-dark d-md-none" style={{ backgroundColor: "#0F2942" }}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="navbar-brand mb-0 d-flex align-items-center" role="button" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <div className="bg-white rounded-2 px-2 py-1 d-inline-flex align-items-center shadow-sm">
              <img
                src="/pharmasure-logo-full.png"
                alt="PharmaSure"
                style={{ height: "26px", objectFit: "contain" }}
              />
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <LanguageSelector variant="dark" />
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#pharmaMobileMenu"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
        <div className="collapse" id="pharmaMobileMenu" style={{ backgroundColor: "#0B1F33" }}>
          <ul className="navbar-nav text-start p-3">
            <li className="nav-item mb-2">
              <Link
                to="/pharmaDashBoard/inventory"
                className={`nav-link rounded-3 px-3 py-2 ${isInventory ? "text-white fw-bold" : "text-white-50"}`}
                style={{ backgroundColor: isInventory ? "rgba(6, 182, 212, 0.2)" : "transparent" }}
              >
                <FaBoxes className="me-2" style={{ color: "#06B6D4" }} /> {t("inventory")}
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link
                to="/pharmaDashBoard/analytics"
                className={`nav-link rounded-3 px-3 py-2 ${isAnalytics ? "text-white fw-bold" : "text-white-50"}`}
                style={{ backgroundColor: isAnalytics ? "rgba(6, 182, 212, 0.2)" : "transparent" }}
              >
                <FaChartBar className="me-2" style={{ color: "#06B6D4" }} /> {t("analytics")}
              </Link>
            </li>
            <li className="nav-item mt-3">
              <button
                className="btn w-100 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 py-2"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#F87171", border: "1px solid rgba(239, 68, 68, 0.3)" }}
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
          backgroundColor: "#0F2942",
          borderRight: "1px solid #1E3A5F",
          boxShadow: "4px 0 20px rgba(15, 41, 66, 0.12)",
        }}
      >
        {/* Brand Logo */}
        <div
          className="d-flex align-items-center justify-content-center mb-4 pt-1 px-3 py-2 rounded-3"
          style={{ background: "#FFFFFF", boxShadow: "0 2px 10px rgba(0,0,0,0.15)", cursor: "pointer" }}
          role="button"
          onClick={() => navigate("/")}
        >
          <img
            src="/pharmasure-logo-full.png"
            alt="PharmaSure Logo"
            style={{ height: "38px", maxWidth: "100%", objectFit: "contain" }}
          />
        </div>
        
        {/* Language Selector */}
        <div className="mb-4 text-center">
          <LanguageSelector variant="dark" />
        </div>

        <ul className="nav flex-column gap-2">
          <li className="nav-item">
            <Link
              to="/pharmaDashBoard/inventory"
              className="nav-link rounded-3 py-2 px-3 d-flex align-items-center transition"
              style={{
                color: isInventory ? "#FFFFFF" : "#94A3B8",
                backgroundColor: isInventory ? "rgba(6, 182, 212, 0.2)" : "transparent",
                borderLeft: isInventory ? "3px solid #06B6D4" : "3px solid transparent",
                fontWeight: isInventory ? 700 : 500,
              }}
            >
              <FaBoxes className="me-2" style={{ color: isInventory ? "#06B6D4" : "#94A3B8" }} /> {t("inventory")}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/pharmaDashBoard/analytics"
              className="nav-link rounded-3 py-2 px-3 d-flex align-items-center transition"
              style={{
                color: isAnalytics ? "#FFFFFF" : "#94A3B8",
                backgroundColor: isAnalytics ? "rgba(6, 182, 212, 0.2)" : "transparent",
                borderLeft: isAnalytics ? "3px solid #06B6D4" : "3px solid transparent",
                fontWeight: isAnalytics ? 700 : 500,
              }}
            >
              <FaChartBar className="me-2" style={{ color: isAnalytics ? "#06B6D4" : "#94A3B8" }} /> {t("analytics")}
            </Link>
          </li>
        </ul>

        <button
          className="btn mt-auto fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 transition"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            color: "#F87171",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
          onClick={handleLogout}
        >
          <FaSignOutAlt /> {t("logout")}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 p-4" style={{ backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default PharmaDashboard;

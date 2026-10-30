import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import {
  FaUserInjured,
  FaUserNurse,
  FaPrescriptionBottleAlt,
  FaArrowRight,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";
import { sanitizeInput } from "../utils/sanitize";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [serverSpinning, setServerSpinning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    const autoEmail = sessionStorage.getItem("demo_auto_email");
    const autoPass = sessionStorage.getItem("demo_auto_pass");
    if (autoEmail) {
      setEmail(autoEmail);
      sessionStorage.removeItem("demo_auto_email");
    }
    if (autoPass) {
      setPassword(autoPass);
      sessionStorage.removeItem("demo_auto_pass");
    }
    return () => clearTimeout(timer);
  }, []);

  const handleRoleQuickFill = (demoEmail, demoPass, roleLabel) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.info(`Filled credentials for ${roleLabel}`, {
      position: "top-center",
      autoClose: 1500,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = sanitizeInput(email, 100).toLowerCase();
    if (!cleanEmail) {
      toast.error("Please enter a valid email address.", { position: "top-center" });
      return;
    }

    setLoading(true);
    setServerSpinning(false);

    // If backend takes > 2.5s to respond, it is waking up from Render free-tier sleep
    const wakeTimer = setTimeout(() => {
      setServerSpinning(true);
    }, 2500);

    try {
      const response = await axios.post(`${baseUrl}/login`, { email: cleanEmail, password });
      clearTimeout(wakeTimer);

      if (response.data.token) {
        sessionStorage.setItem("token", response.data.token);
      }
      sessionStorage.setItem("role", response.data.role);

      if (response.data.role === "PHARMASURE") {
        const admin = response.data.admin;
        sessionStorage.setItem("id", admin.id);
        sessionStorage.setItem("email", admin.email);

        toast.success("Welcome Pharmacist! Directing to terminal...", {
          position: "top-center",
          autoClose: 1500,
        });

        setTimeout(() => {
          navigate("/pharmaDashBoard");
        }, 1500);
      } else {
        const patient = response.data.patient;

        sessionStorage.setItem("pid", patient.pid);
        sessionStorage.setItem("name", patient.name);
        sessionStorage.setItem("email", patient.email);
        sessionStorage.setItem("careTakerEmail", patient.careTakerEmail);

        toast.success(`Welcome back, ${patient.name}!`, {
          position: "top-center",
          autoClose: 1500,
        });

        setTimeout(() => {
          navigate("/userDashboard");
        }, 1500);
      }
    } catch (error) {
      clearTimeout(wakeTimer);
      console.error("Login failed:", error);
      toast.error("Invalid credentials. Try our 1-click demo roles below!", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      clearTimeout(wakeTimer);
      setLoading(false);
      setServerSpinning(false);
    }
  };

  return (
    <div className="bio-ambient-mesh min-vh-100 d-flex flex-column position-relative overflow-hidden">
      {/* Background Glow Orbs - Constrained to prevent mobile horizontal scroll */}
      <div
        className="position-absolute rounded-circle bio-glow-pulse"
        style={{
          width: "360px",
          height: "360px",
          background: "radial-gradient(circle, rgba(0, 242, 255, 0.18) 0%, transparent 70%)",
          top: "-60px",
          left: "-60px",
          pointerEvents: "none",
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />
      <div
        className="position-absolute rounded-circle bio-glow-pulse"
        style={{
          width: "380px",
          height: "380px",
          background: "radial-gradient(circle, rgba(255, 103, 50, 0.14) 0%, transparent 70%)",
          bottom: "-80px",
          right: "-80px",
          pointerEvents: "none",
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />

      {/* Top Navigation Bar - Flows naturally in layout, never overlaps form on mobile */}
      <header
        className="w-100 py-3 px-3 px-sm-4 d-flex justify-content-between align-items-center position-relative"
        style={{ zIndex: 20 }}
      >
        <div
          className="d-flex align-items-center gap-2"
          role="button"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <div className="bg-white rounded-2 px-2 py-1 d-inline-flex align-items-center shadow-sm border border-light">
            <picture>
              <source srcSet="/pharmasure-logo-full.webp" type="image/webp" />
              <img
                src="/pharmasure-logo-full.png"
                alt="PharmaSure"
                width="100"
                height="36"
                style={{ height: "32px", width: "auto", objectFit: "contain" }}
              />
            </picture>
          </div>
          <span className="badge bio-pill-cyan d-none d-sm-inline-block" style={{ fontSize: "10px" }}>
            DSCSA 2.0
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <LanguageSelector variant="light" />
        </div>
      </header>

      {/* Main Form Center Area */}
      <main
        className="flex-grow-1 d-flex justify-content-center align-items-center px-3 py-3 py-sm-4 position-relative"
        style={{ zIndex: 10 }}
      >
        <div
          className="bio-floating-window w-100 shadow-sm transition"
          style={{
            maxWidth: "440px",
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            opacity: loaded ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "20px",
          }}
        >
          {/* Window Titlebar */}
          <div className="bio-window-bar d-flex justify-content-between align-items-center px-3 py-2">
            <div className="bio-window-dots d-flex align-items-center gap-1.5">
              <span className="bio-window-dot bio-dot-red"></span>
              <span className="bio-window-dot bio-dot-yellow"></span>
              <span className="bio-window-dot bio-dot-green"></span>
            </div>
            <span
              className="font-mono text-muted d-none d-sm-inline"
              style={{ fontSize: "11px", color: "#64748B" }}
            >
              pharmasure-auth.protocol
            </span>
            <span
              className="font-mono text-muted d-inline d-sm-none"
              style={{ fontSize: "10.5px", color: "#64748B" }}
            >
              auth.protocol
            </span>
            <span className="badge bio-pill-cyan py-1 px-2 d-inline-flex align-items-center gap-1" style={{ fontSize: "10px" }}>
              <FaShieldAlt size={9} /> SSL Active
            </span>
          </div>

          {/* Form Content */}
          <div className="p-3 p-sm-4 p-md-4">
            <div className="text-center mb-3">
              <h3 className="fw-bolder bio-heading mb-1" style={{ color: "#0F2942", fontSize: "1.45rem" }}>
                {t("login")}
              </h3>
              <p className="small mb-0 text-muted" style={{ fontSize: "13px" }}>
                Enter credentials or tap a 1-click role below
              </p>
            </div>

            <form onSubmit={handleLogin} noValidate>
              {/* Email Input */}
              <div className="mb-3">
                <label
                  className="form-label small fw-semibold font-mono d-flex align-items-center gap-1 mb-1.5"
                  style={{ color: "#0F2942", fontSize: "12px" }}
                >
                  <FaEnvelope style={{ color: "#06B6D4" }} /> EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  className="form-control font-mono py-2.5 px-3"
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    borderRadius: "12px",
                    color: "#0F2942",
                    fontSize: "15px",
                    minHeight: "46px",
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="name@pharmasure.com"
                />
              </div>

              {/* Password Input */}
              <div className="mb-3.5">
                <label
                  className="form-label small fw-semibold font-mono d-flex align-items-center gap-1 mb-1.5"
                  style={{ color: "#0F2942", fontSize: "12px" }}
                >
                  <FaLock style={{ color: "#06B6D4" }} /> PASSWORD / PIN
                </label>
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control font-mono py-2.5 px-3 pe-5"
                    style={{
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #CBD5E1",
                      borderRadius: "12px",
                      color: "#0F2942",
                      fontSize: "15px",
                      minHeight: "46px",
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-1 d-flex align-items-center justify-content-center"
                    style={{
                      color: "#64748B",
                      background: "transparent",
                      border: "none",
                      width: "42px",
                      height: "42px",
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bio-btn-glow w-100 py-2.5 mt-2 d-flex align-items-center justify-content-center gap-2 fw-bold"
                style={{ minHeight: "48px", borderRadius: "12px", fontSize: "14.5px" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm text-light" role="status" />
                    <span>{serverSpinning ? "Waking Cloud Backend..." : "Verifying Credentials..."}</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Enter</span>
                    <FaArrowRight size={13} />
                  </>
                )}
              </button>

              {/* Free-tier Server Spin Banner */}
              {serverSpinning && (
                <div
                  className="mt-3 p-2.5 rounded-3 text-center small font-mono"
                  style={{
                    background: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    color: "#92400E",
                    fontSize: "11.5px",
                    lineHeight: "1.45",
                  }}
                >
                  ⏳ <strong>Waking Server:</strong> Cloud free tier sleeps after inactivity. First wake takes ~30–45s. Please wait...
                </div>
              )}
            </form>

            {/* 1-Click Fast Role Selection - Responsive layout for mobile & desktop */}
            <div className="mt-4 pt-3 border-top" style={{ borderColor: "#E2E8F0" }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small font-mono fw-semibold" style={{ fontSize: "11px", color: "#64748B" }}>
                  ⚡ 1-CLICK DEMO ROLES:
                </span>
                <span className="badge bg-light text-muted border" style={{ fontSize: "9.5px" }}>
                  Instant Fill
                </span>
              </div>

              {/* Responsive Role Pills: Grid ensures perfect sizing on all screens */}
              <div className="row g-2">
                <div className="col-4">
                  <button
                    type="button"
                    className="btn btn-outline-info w-100 py-2 px-1 d-flex flex-column flex-sm-row align-items-center justify-content-center gap-1 text-truncate"
                    style={{
                      fontSize: "11.5px",
                      borderRadius: "10px",
                      borderColor: "#BAE6FD",
                      backgroundColor: "#F0F9FF",
                      color: "#0369A1",
                      minHeight: "42px",
                    }}
                    onClick={() => handleRoleQuickFill("harshithp914@gmail.com", "student123", "Patient")}
                  >
                    <FaUserInjured style={{ color: "#0284C7" }} />
                    <span className="fw-semibold">Patient</span>
                  </button>
                </div>

                <div className="col-4">
                  <button
                    type="button"
                    className="btn btn-outline-warning w-100 py-2 px-1 d-flex flex-column flex-sm-row align-items-center justify-content-center gap-1 text-truncate"
                    style={{
                      fontSize: "11.5px",
                      borderRadius: "10px",
                      borderColor: "#FED7AA",
                      backgroundColor: "#FFF7ED",
                      color: "#C2410C",
                      minHeight: "42px",
                    }}
                    onClick={() => handleRoleQuickFill("harshithp9141@gmail.com", "student123", "Caretaker")}
                  >
                    <FaUserNurse style={{ color: "#EA580C" }} />
                    <span className="fw-semibold">Caretaker</span>
                  </button>
                </div>

                <div className="col-4">
                  <button
                    type="button"
                    className="btn btn-outline-teal w-100 py-2 px-1 d-flex flex-column flex-sm-row align-items-center justify-content-center gap-1 text-truncate"
                    style={{
                      fontSize: "11.5px",
                      borderRadius: "10px",
                      borderColor: "#99F6E4",
                      backgroundColor: "#F0FDFA",
                      color: "#0F766E",
                      minHeight: "42px",
                    }}
                    onClick={() => handleRoleQuickFill("pharmacist@pharmasure.com", "admin123", "Pharmacist")}
                  >
                    <FaPrescriptionBottleAlt style={{ color: "#0D9488" }} />
                    <span className="fw-semibold">Pharmacist</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Register link */}
            <div className="mt-4 text-center small text-muted">
              <span>Need a fresh patient profile? </span>
              <button
                type="button"
                className="btn btn-link p-0 fw-bold text-decoration-none"
                style={{ color: "#06B6D4", fontSize: "13px" }}
                onClick={() => navigate("/register")}
              >
                Register here
              </button>
            </div>
          </div>
        </div>
      </main>

      <ToastContainer position="top-center" autoClose={2000} limit={2} />
    </div>
  );
};

export default Login;

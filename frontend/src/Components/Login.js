import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import { FaUserInjured, FaUserNurse, FaPrescriptionBottleAlt, FaArrowRight, FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

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
    const timer = setTimeout(() => setLoaded(true), 150);
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

  const handleRoleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.info(`Filled credentials for ${demoEmail.split("@")[0]}`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerSpinning(false);

    // If backend takes > 2.5s to respond, it is waking up from Render free-tier sleep
    const wakeTimer = setTimeout(() => {
      setServerSpinning(true);
    }, 2500);

    try {
      const response = await axios.post(`${baseUrl}/login`, { email, password });
      clearTimeout(wakeTimer);
      console.log("Login success:", response.data);

      sessionStorage.setItem("role", response.data.role);

      if (response.data.role === "PHARMASURE") {
        const admin = response.data.admin;
        sessionStorage.setItem("id", admin.id);
        sessionStorage.setItem("email", admin.email);

        toast.success("Welcome Pharmacist! Directing to terminal...", {
          position: "top-center",
          autoClose: 1800,
        });

        setTimeout(() => {
          navigate("/pharmaDashBoard");
        }, 1800);
      } else {
        const patient = response.data.patient;

        sessionStorage.setItem("pid", patient.pid);
        sessionStorage.setItem("name", patient.name);
        sessionStorage.setItem("email", patient.email);
        sessionStorage.setItem("careTakerEmail", patient.careTakerEmail);

        toast.success(`Welcome back, ${patient.name}!`, {
          position: "top-center",
          autoClose: 1800,
        });

        setTimeout(() => {
          navigate("/userDashboard");
        }, 1800);
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
    <div className="bio-ambient-mesh min-vh-100 d-flex justify-content-center align-items-center position-relative p-3">
      {/* Background Glow Orbs */}
      <div
        className="position-absolute rounded-circle bio-glow-pulse"
        style={{
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(0, 242, 255, 0.22) 0%, transparent 70%)",
          top: "10%",
          left: "10%",
          pointerEvents: "none",
          filter: "blur(60px)",
        }}
      />
      <div
        className="position-absolute rounded-circle bio-glow-pulse"
        style={{
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(255, 103, 50, 0.18) 0%, transparent 70%)",
          bottom: "10%",
          right: "10%",
          pointerEvents: "none",
          filter: "blur(60px)",
        }}
      />

      {/* Top Bar with Brand & Language */}
      <div className="position-absolute top-0 start-0 end-0 p-4 d-flex justify-content-between align-items-center" style={{ zIndex: 100 }}>
        <div className="d-flex align-items-center gap-2" role="button" onClick={() => navigate("/")}>
          <picture>
            <source srcSet="/pharmasure-logo-full.webp" type="image/webp" />
            <img
              src="/pharmasure-logo-full.png"
              alt="PharmaSure"
              width="100"
              height="40"
              style={{ height: "40px", width: "auto", objectFit: "contain" }}
            />
          </picture>
        </div>
        <LanguageSelector variant="light" />
      </div>

      {/* Floating Window Login Box */}
      <div
        className={`bio-floating-window bio-animate-float-3 w-100 p-0 shadow-sm transition`}
        style={{
          maxWidth: "460px",
          transform: loaded ? "translateY(0)" : "translateY(30px)",
          opacity: loaded ? 1 : 0,
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 10,
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
        }}
      >
        {/* Window Titlebar */}
        <div className="bio-window-bar">
          <div className="bio-window-dots">
            <span className="bio-window-dot bio-dot-red"></span>
            <span className="bio-window-dot bio-dot-yellow"></span>
            <span className="bio-window-dot bio-dot-green"></span>
          </div>
          <span className="font-mono small" style={{ fontSize: "11px", color: "#64748B" }}>
            pharmasure-auth.protocol
          </span>
          <span className="badge bio-pill-cyan" style={{ fontSize: "10px" }}>
            Secure SSL
          </span>
        </div>

        <div className="p-4 p-md-5">
          <div className="text-center mb-4">
            <picture>
              <source srcSet="/pharmasure-logo-full.webp" type="image/webp" />
              <img
                src="/pharmasure-logo-full.png"
                alt="PharmaSure"
                width="115"
                height="46"
                style={{ height: "46px", width: "auto", objectFit: "contain", marginBottom: "1rem" }}
              />
            </picture>
            <h4 className="fw-bold bio-heading mb-1" style={{ color: "#0F2942" }}>{t("login")}</h4>
            <p className="small mb-0" style={{ color: "#64748B" }}>Enter credentials or tap a 1-click role below</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small font-mono d-flex align-items-center gap-1" style={{ color: "#0F2942" }}>
                <FaEnvelope style={{ color: "#06B6D4" }} /> EMAIL ADDRESS:
              </label>
              <input
                type="email"
                className="form-control font-mono py-2 px-3"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #CBD5E1",
                  borderRadius: "10px",
                  color: "#0F2942",
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@pharmasure.com"
              />
            </div>

            <div className="mb-4">
              <label className="form-label small font-mono d-flex align-items-center gap-1" style={{ color: "#0F2942" }}>
                <FaLock style={{ color: "#06B6D4" }} /> SECURITY KEY / PASSWORD:
              </label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control font-mono py-2 px-3 pe-5"
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    borderRadius: "10px",
                    color: "#0F2942",
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 p-1"
                  style={{ color: "#64748B", background: "none", border: "none" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="bio-btn-glow w-100 py-3 d-flex align-items-center justify-content-center gap-2"
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

            {serverSpinning && (
              <div
                className="mt-3 p-2 rounded-3 text-center small font-mono"
                style={{
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  color: "#92400E",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              >
                ⏳ <strong>Waking Server:</strong> Render free-tier sleeps after 15 min of inactivity.
                <br />
                Cold start takes ~45–60s on the first request. Please wait...
              </div>
            )}
          </form>

          {/* 1-Click Fast Role Selection for Quick Evaluator Access */}
          <div className="mt-4 pt-3 border-top" style={{ borderColor: "#E2E8F0" }}>
            <span className="small font-mono d-block text-center mb-2" style={{ fontSize: "11px", color: "#64748B" }}>
              ⚡ QUICK DEMO AUTO-FILL:
            </span>
            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                className="bio-btn-outline d-flex align-items-center gap-1 rounded-pill px-3 py-1"
                style={{ fontSize: "11px", height: "auto" }}
                onClick={() => handleRoleQuickFill("harshithp914@gmail.com", "student123")}
              >
                <FaUserInjured style={{ color: "#06B6D4" }} /> Patient
              </button>
              <button
                type="button"
                className="bio-btn-outline d-flex align-items-center gap-1 rounded-pill px-3 py-1"
                style={{ fontSize: "11px", height: "auto" }}
                onClick={() => handleRoleQuickFill("harshithp9141@gmail.com", "student123")}
              >
                <FaUserNurse style={{ color: "#EA580C" }} /> Caretaker
              </button>
              <button
                type="button"
                className="bio-btn-outline d-flex align-items-center gap-1 rounded-pill px-3 py-1"
                style={{ fontSize: "11px", height: "auto" }}
                onClick={() => handleRoleQuickFill("pharmacist@pharmasure.com", "admin123")}
              >
                <FaPrescriptionBottleAlt style={{ color: "#0D9488" }} /> Pharmacist
              </button>
            </div>
          </div>

          <p className="mt-4 text-center small mb-0" style={{ color: "#64748B" }}>
            Need a fresh patient profile?{" "}
            <span
              className="fw-bold"
              style={{ cursor: "pointer", textDecoration: "underline", color: "#06B6D4" }}
              onClick={() => navigate("/register")}
            >
              Register here
            </span>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;

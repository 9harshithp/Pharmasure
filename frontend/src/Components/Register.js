import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../App";
import { ToastContainer, toast } from "react-toastify";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserNurse,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";
import { sanitizeInput, validateEmail } from "../utils/sanitize";

const Register = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [careTakerEmail, setCareTakerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name, 100);
    const cleanEmail = sanitizeInput(email, 100).toLowerCase();
    const cleanCareTakerEmail = sanitizeInput(careTakerEmail, 100).toLowerCase();

    if (!cleanName) {
      toast.error("Please enter your full name.", { position: "top-center" });
      return;
    }
    if (!validateEmail(cleanEmail)) {
      toast.error("Please enter a valid email address.", { position: "top-center" });
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long.", { position: "top-center" });
      return;
    }
    if (cleanCareTakerEmail && !validateEmail(cleanCareTakerEmail)) {
      toast.error("Please enter a valid caretaker email address.", { position: "top-center" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/register`, {
        name: cleanName,
        email: cleanEmail,
        password,
        careTakerEmail: cleanCareTakerEmail || null,
      });

      toast.success(response.data || "Registration successful! Directing to login...", {
        position: "top-center",
        autoClose: 1800,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (error) {
      toast.error(error.response?.data || "Registration failed. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bio-ambient-mesh min-vh-100 d-flex flex-column position-relative overflow-hidden">
      {/* Ambient Glow Background - Constrained to prevent mobile overflow */}
      <div
        className="position-absolute rounded-circle bio-glow-pulse"
        style={{
          width: "360px",
          height: "360px",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.16) 0%, transparent 70%)",
          top: "-60px",
          right: "-60px",
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
          background: "radial-gradient(circle, rgba(13, 148, 136, 0.14) 0%, transparent 70%)",
          bottom: "-80px",
          left: "-80px",
          pointerEvents: "none",
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />

      {/* Top Header */}
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

      {/* Main Register Card Center Area */}
      <main
        className="flex-grow-1 d-flex justify-content-center align-items-center px-3 py-3 py-sm-4 position-relative"
        style={{ zIndex: 10 }}
      >
        <div
          className="bio-floating-window w-100 shadow-sm transition"
          style={{
            maxWidth: "460px",
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
              pharmasure-register.sys
            </span>
            <span
              className="font-mono text-muted d-inline d-sm-none"
              style={{ fontSize: "10.5px", color: "#64748B" }}
            >
              register.sys
            </span>
            <span className="badge bio-pill-cyan py-1 px-2 d-inline-flex align-items-center gap-1" style={{ fontSize: "10px" }}>
              <FaShieldAlt size={9} /> HIPAA & DSCSA
            </span>
          </div>

          {/* Form Body */}
          <div className="p-3 p-sm-4">
            <div className="text-center mb-3">
              <h3 className="fw-bolder bio-heading mb-1" style={{ color: "#0F2942", fontSize: "1.45rem" }}>
                {t("register") || "Patient Registration"}
              </h3>
              <p className="small mb-0 text-muted" style={{ fontSize: "13px" }}>
                Create your Zero-Risk medical profile
              </p>
            </div>

            <form onSubmit={handleRegister} noValidate>
              {/* Full Name */}
              <div className="mb-2.5">
                <label
                  className="form-label small fw-semibold font-mono d-flex align-items-center gap-1 mb-1"
                  style={{ color: "#0F2942", fontSize: "11.5px" }}
                >
                  <FaUser style={{ color: "#06B6D4" }} /> FULL NAME
                </label>
                <input
                  type="text"
                  className="form-control font-mono py-2 px-3"
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    borderRadius: "11px",
                    color: "#0F2942",
                    fontSize: "14.5px",
                    minHeight: "44px",
                  }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. John Doe"
                />
              </div>

              {/* Email Address */}
              <div className="mb-2.5">
                <label
                  className="form-label small fw-semibold font-mono d-flex align-items-center gap-1 mb-1"
                  style={{ color: "#0F2942", fontSize: "11.5px" }}
                >
                  <FaEnvelope style={{ color: "#06B6D4" }} /> EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  className="form-control font-mono py-2 px-3"
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    borderRadius: "11px",
                    color: "#0F2942",
                    fontSize: "14.5px",
                    minHeight: "44px",
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="patient@example.com"
                />
              </div>

              {/* Password */}
              <div className="mb-2.5">
                <label
                  className="form-label small fw-semibold font-mono d-flex align-items-center gap-1 mb-1"
                  style={{ color: "#0F2942", fontSize: "11.5px" }}
                >
                  <FaLock style={{ color: "#06B6D4" }} /> PASSWORD (MIN. 6 CHARACTERS)
                </label>
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control font-mono py-2 px-3 pe-5"
                    style={{
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #CBD5E1",
                      borderRadius: "11px",
                      color: "#0F2942",
                      fontSize: "14.5px",
                      minHeight: "44px",
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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
                      width: "40px",
                      height: "40px",
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Caretaker Email (Optional) */}
              <div className="mb-3.5">
                <label
                  className="form-label small fw-semibold font-mono d-flex align-items-center gap-1 mb-1"
                  style={{ color: "#0F2942", fontSize: "11.5px" }}
                >
                  <FaUserNurse style={{ color: "#EA580C" }} /> CARETAKER EMAIL (OPTIONAL)
                </label>
                <input
                  type="email"
                  className="form-control font-mono py-2 px-3"
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    borderRadius: "11px",
                    color: "#0F2942",
                    fontSize: "14.5px",
                    minHeight: "44px",
                  }}
                  value={careTakerEmail}
                  onChange={(e) => setCareTakerEmail(e.target.value)}
                  placeholder="caretaker@example.com"
                />
                <small className="text-muted d-block mt-1" style={{ fontSize: "11px" }}>
                  Your caretaker will receive automated emergency & missed-dose alerts.
                </small>
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
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <FaArrowRight size={13} />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-3.5 pt-2 text-center small text-muted border-top" style={{ borderColor: "#E2E8F0" }}>
              <span>Already registered? </span>
              <button
                type="button"
                className="btn btn-link p-0 fw-bold text-decoration-none"
                style={{ color: "#06B6D4", fontSize: "13px" }}
                onClick={() => navigate("/login")}
              >
                Sign in to your account
              </button>
            </div>
          </div>
        </div>
      </main>

      <ToastContainer position="top-center" autoClose={2000} limit={2} />
    </div>
  );
};

export default Register;

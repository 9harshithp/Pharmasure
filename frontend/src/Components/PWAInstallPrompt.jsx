import React, { useState, useEffect } from "react";
import { FaDownload, FaTimes, FaMobileAlt } from "react-icons/fa";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed as PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if user dismissed prompt in this session
    if (sessionStorage.getItem("pharmasure_pwa_dismissed")) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Standard Chromium beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("pharmasure_pwa_dismissed", "true");
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div
      className="position-fixed bottom-0 start-50 translate-middle-x mb-3 px-3 w-100"
      style={{ maxWidth: "520px", zIndex: 9999 }}
    >
      <div
        className="d-flex align-items-center justify-content-between p-3 rounded-4 shadow-lg text-white"
        style={{
          background: "linear-gradient(135deg, #0F2942 0%, #164E63 100%)",
          border: "1px solid rgba(6, 182, 212, 0.4)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 10px 35px rgba(15, 41, 66, 0.45)",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 p-2 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(6, 182, 212, 0.2)", color: "#06B6D4" }}
          >
            <FaMobileAlt size={22} />
          </div>
          <div>
            <div className="fw-bold small" style={{ color: "#F8FAFC" }}>
              Install PharmaSure App
            </div>
            <div className="small font-mono text-muted" style={{ fontSize: "11px", color: "#94A3B8" }}>
              Full-screen clinical mode • Offline access
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="btn btn-sm d-flex align-items-center gap-1.5 fw-semibold px-3 py-1.5 rounded-pill text-white"
              style={{
                background: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
                border: "none",
                fontSize: "12px",
              }}
            >
              <FaDownload size={11} />
              <span>Install</span>
            </button>
          )}

          {isIOS && !deferredPrompt && (
            <span className="small text-info font-mono" style={{ fontSize: "11px" }}>
              Tap Share ⎋ → Add to Home Screen
            </span>
          )}

          <button
            onClick={handleDismiss}
            className="btn btn-sm text-secondary p-1"
            style={{ color: "#94A3B8", background: "transparent", border: "none" }}
            aria-label="Dismiss install prompt"
          >
            <FaTimes size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

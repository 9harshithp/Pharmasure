import React, { useState, useEffect } from "react";
import {
  FaDownload,
  FaTimes,
  FaMobileAlt,
  FaApple,
  FaAndroid,
  FaDesktop,
  FaCheckCircle,
  FaShareAlt,
  FaPlusSquare,
} from "react-icons/fa";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [platform, setPlatform] = useState("desktop");

  useEffect(() => {
    // 1. Check if running as installed standalone PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // 2. Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform("ios");
    } else if (/android/.test(ua)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // 3. Check session dismissal
    if (sessionStorage.getItem("pharmasure_pwa_dismissed") === "true") {
      setIsDismissed(true);
    }

    // 4. Capture browser beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPWAInstallPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      window.deferredPWAInstallPrompt = null;
    });

    // 5. Global listener for Navbar "Install App" clicks
    const handleTriggerInstall = () => {
      handleOpenInstall();
    };
    window.addEventListener("openPWAInstall", handleTriggerInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("openPWAInstall", handleTriggerInstall);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenInstall = async () => {
    const promptEvent = deferredPrompt || window.deferredPWAInstallPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
      window.deferredPWAInstallPrompt = null;
    } else {
      // If browser doesn't expose native event, show direct 1-tap guide
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("pharmasure_pwa_dismissed", "true");
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* 🌟 Floating Bottom Install Bar (Always visible in browser mode until dismissed) */}
      {!isDismissed && (
        <div
          className="position-fixed bottom-0 start-50 translate-middle-x mb-3 px-3 w-100"
          style={{ maxWidth: "540px", zIndex: 9998, animation: "slideUp 0.3s ease-out" }}
        >
          <div
            className="d-flex align-items-center justify-content-between p-3 rounded-4 shadow-lg text-white"
            style={{
              background: "linear-gradient(135deg, #0F2942 0%, #164E63 100%)",
              border: "1px solid rgba(6, 182, 212, 0.45)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 10px 35px rgba(15, 41, 66, 0.5)",
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 p-2.5 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ background: "rgba(6, 182, 212, 0.2)", color: "#06B6D4" }}
              >
                <FaMobileAlt size={22} />
              </div>
              <div>
                <div className="fw-bold small" style={{ color: "#F8FAFC" }}>
                  Install PharmaSure App
                </div>
                <div className="small font-mono" style={{ fontSize: "11px", color: "#94A3B8" }}>
                  Zero-Risk Alerts • Full-Screen • Offline
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                onClick={handleOpenInstall}
                className="btn btn-sm d-flex align-items-center gap-1.5 fw-semibold px-3 py-1.5 rounded-pill text-white shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
                  border: "none",
                  fontSize: "12px",
                }}
              >
                <FaDownload size={11} />
                <span>Install</span>
              </button>

              <button
                onClick={handleDismiss}
                className="btn btn-sm p-1 text-secondary"
                style={{ color: "#94A3B8", background: "transparent", border: "none" }}
                aria-label="Close install prompt"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📋 Step-by-Step Installation Modal (When browser native prompt is deferred) */}
      {showInstructions && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(15, 41, 66, 0.8)", zIndex: 10600, backdropFilter: "blur(6px)" }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "480px" }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div
                className="modal-header text-white px-4 py-3"
                style={{ background: "linear-gradient(135deg, #0F2942 0%, #0D9488 100%)" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <FaDownload className="text-info" />
                  <h5 className="modal-title fw-bold mb-0" style={{ fontSize: "16px" }}>
                    Install PharmaSure Application
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowInstructions(false)}
                />
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="text-center mb-3">
                  <img
                    src="/pharmasure-logo-full.webp"
                    alt="PharmaSure"
                    height="40"
                    className="mb-2"
                  />
                  <p className="small text-muted mb-0 font-mono">
                    Install to home screen for instant access without a browser URL bar.
                  </p>
                </div>

                {platform === "ios" ? (
                  /* iOS Safari Instructions */
                  <div className="p-3 bg-white rounded-3 border mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold small">
                      <FaApple size={18} /> Safari on iPhone / iPad:
                    </div>
                    <ol className="small text-muted mb-0 ps-3 font-mono" style={{ fontSize: "12px", lineHeight: "1.8" }}>
                      <li>
                        Tap the <strong>Share</strong> button <FaShareAlt className="text-primary ms-1" /> at the bottom of Safari.
                      </li>
                      <li>
                        Scroll down and tap <strong>Add to Home Screen</strong> <FaPlusSquare className="text-primary ms-1" />.
                      </li>
                      <li>
                        Tap <strong>Add</strong> in the top-right corner.
                      </li>
                    </ol>
                  </div>
                ) : platform === "android" ? (
                  /* Android Chrome Instructions */
                  <div className="p-3 bg-white rounded-3 border mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2 text-success fw-bold small">
                      <FaAndroid size={18} /> Chrome / Browser on Android:
                    </div>
                    <ol className="small text-muted mb-0 ps-3 font-mono" style={{ fontSize: "12px", lineHeight: "1.8" }}>
                      <li>
                        Tap the menu <strong>(⋮)</strong> in the top-right corner of Chrome.
                      </li>
                      <li>
                        Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                      </li>
                      <li>
                        Confirm <strong>"Install"</strong> when prompted.
                      </li>
                    </ol>
                  </div>
                ) : (
                  /* Desktop Chrome / Edge Instructions */
                  <div className="p-3 bg-white rounded-3 border mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2 text-info fw-bold small">
                      <FaDesktop size={18} /> Desktop (Chrome, Edge, Brave):
                    </div>
                    <ol className="small text-muted mb-0 ps-3 font-mono" style={{ fontSize: "12px", lineHeight: "1.8" }}>
                      <li>
                        Look at the right side of the URL address bar above.
                      </li>
                      <li>
                        Click the <strong>Install PharmaSure</strong> icon <strong>(⊕)</strong> or computer screen icon.
                      </li>
                      <li>
                        Click <strong>Install</strong> to launch the standalone desktop window.
                      </li>
                    </ol>
                  </div>
                )}

                <div className="d-flex align-items-center gap-2 p-2 rounded-2" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                  <FaCheckCircle className="text-success" />
                  <span className="small text-success font-mono" style={{ fontSize: "11px" }}>
                    DSCSA 2.0 PWA • Offline Cache Enabled • Zero App Store Fees
                  </span>
                </div>
              </div>

              <div className="modal-footer bg-white py-2 px-4 justify-content-between">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowInstructions(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary px-3 rounded-pill"
                  onClick={() => setShowInstructions(false)}
                >
                  Got It!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;

import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { baseUrl } from "../App";
import {
  FaPills,
  FaChartLine,
  FaCheckCircle,
  FaUser,
  FaBrain,
  FaBell,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserDashBoard = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("patient");
  const [alertStatus, setAlertStatus] = useState(false);
  const [pid, setPid] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [missedTablets, setMissedTablets] = useState([]);
  const [showMissedModal, setShowMissedModal] = useState(false);

  useEffect(() => {
    const storedName = sessionStorage.getItem("name");
    const storedRole = sessionStorage.getItem("role");
    const storedPid = sessionStorage.getItem("pid");
    const storedEmail = sessionStorage.getItem("email");
    const medicationChecked = sessionStorage.getItem("medicationChecked");

    if (!storedName || !storedPid || !storedEmail) {
      navigate("/");
      return;
    }

    setName(storedName);
    setRole(storedRole);
    setPid(storedPid);

    fetchAlertStatus(storedPid, storedRole);
    
    if (!medicationChecked) {
      checkMedicationStatus(storedEmail);
      sessionStorage.setItem("medicationChecked", "true");
    }
  }, [navigate]);

  const fetchAlertStatus = async (id, userRole) => {
    try {
      const response = await axios.get(`${baseUrl}/getById/${id}`);
      if (response.status === 200) {
        const alertValue = response.data.alert;
        setAlertStatus(alertValue);
        sessionStorage.setItem("alert", alertValue.toString());
        if (userRole === "caretaker" && alertValue) {
          setShowAlertModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching alert status:", error);
    }
  };

  // const checkMedicationStatus = async (email) => {
  //   try {
  //     const res = await axios.get(`${baseUrl}/consumed/check/${email}`);
  //     if (res.status === 200) {
  //       const meds = res.data;
  //       const now = new Date();
  //       const timeInMinutes = now.getHours() * 60 + now.getMinutes();


  //       const morningEnd = 9 * 60 + 30; // 9:30 AM
  //       const afternoonEnd = 14 * 60 + 30; // 2:30 PM
  //       const eveningEnd = 19 * 60 + 30; // 7:30 PM

  //       let relevantTimings = [];

  //       if (timeInMinutes > eveningEnd) {
  //         relevantTimings = ["morning", "afternoon", "evening"];
  //       } else if (timeInMinutes > afternoonEnd) {
  //         relevantTimings = ["morning", "afternoon"];
  //       } else if (timeInMinutes > morningEnd) {
  //         relevantTimings = ["morning"];
  //       }

  //       const missed = meds.filter(
  //         (m) =>
  //           relevantTimings.includes(m.timing.toLowerCase()) &&
  //           m.status.includes("not taken")
  //       );

  //       if (missed.length > 0) {
  //         setMissedTablets(missed);
  //         setShowMissedModal(true);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error checking medication status:", err);
  //   }


  // };

  const checkMedicationStatus = async (email) => {
  try {
    const res = await axios.get(`${baseUrl}/consumed/check/${email}`);
    if (res.status === 200) {
      const meds = res.data;
      const now = new Date();
      const timeInMinutes = now.getHours() * 60 + now.getMinutes();

      const morningEnd = 9 * 60 + 30; // 9:30 AM
      const afternoonEnd = 14 * 60 + 30; // 2:30 PM
      const eveningEnd = 19 * 60 + 30; // 7:30 PM

      // Determine current timing window
      let currentTiming = "";
      if (timeInMinutes <= morningEnd) {
        currentTiming = "morning";
      } else if (timeInMinutes <= afternoonEnd) {
        currentTiming = "afternoon";
      } else if (timeInMinutes <= eveningEnd) {
        currentTiming = "evening";
      }

      // Filter only current timing’s missed medicines
      const missed = meds.filter(
        (m) =>
          m.timing.toLowerCase() === currentTiming &&
          m.status.includes("not taken")
      );

      if (missed.length > 0) {
        setMissedTablets(missed);
        setShowMissedModal(true);
      }
    }
  } catch (err) {
    console.error("Error checking medication status:", err);
  }
};


  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const handleAlert = async () => {
    if (!pid) return;
    try {
      const response = await axios.put(`${baseUrl}/setAlert/${pid}`);
      if (response.status === 200) {
        setAlertStatus(true);
        sessionStorage.setItem("alert", "true");
        toast.success("Alert sent successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to send alert!");
    }
  };

  const handleClearAlert = async () => {
    if (!pid) return;
    try {
      const response = await axios.put(`${baseUrl}/clearAlert/${pid}`);
      if (response.status === 200) {
        setAlertStatus(false);
        setShowAlertModal(false);
        sessionStorage.setItem("alert", "false");
        toast.success("Alert cleared successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to clear alert!");
    }
  };

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
  <ToastContainer position="top-center" autoClose={2000} />

  {/* Mobile Navbar */}
  <nav className="navbar navbar-dark bg-dark d-md-none">
    <div className="container-fluid">
      <span className="navbar-brand fw-bold">💊 PHARMASURE</span>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mobileMenu"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
    </div>
    <div className="collapse" id="mobileMenu">
      <ul className="navbar-nav text-start bg-dark p-3">
        <li className="nav-item mb-2">
          <Link to="/userDashBoard/manageMedication" className="nav-link text-white">
            <FaPills className="me-2" /> Manage Medication
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/userDashBoard/consumedChart" className="nav-link text-white">
            <FaChartLine className="me-2" /> Consumed Chart
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/userDashBoard/ConsumedCount" className="nav-link text-white">
            <FaCheckCircle className="me-2" /> Consumed Count
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/userDashBoard/mentalSupport" className="nav-link text-white">
            <FaBrain className="me-2" /> Mental Support
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/userDashBoard/profile" className="nav-link text-white">
            <FaUser className="me-2" /> Profile
          </Link>
        </li>
        {role === "patient" && (
          <li className="nav-item mt-3">
            <button
              className={`btn ${alertStatus ? "btn-secondary" : "btn-warning"} w-100 fw-bold d-flex align-items-center justify-content-center gap-2`}
              disabled={alertStatus}
              onClick={handleAlert}
            >
              <FaBell /> {alertStatus ? "Alert Sent" : "Send Alert"}
            </button>
          </li>
        )}
        <li className="nav-item mt-3">
          <button
            className="btn btn-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </button>
        </li>
      </ul>
    </div>
  </nav>

  {/* Sidebar (Desktop Only) */}
  <div className="bg-dark text-white d-none d-md-flex flex-column p-3" style={{ width: "250px" }}>
    <h3 className="mb-4 text-center fw-bold">💊 PHARMASURE</h3>
    <ul className="nav flex-column text-start ">
      <li className="nav-item mb-2">
        <Link to="/userDashBoard/manageMedication" className="nav-link text-white">
          <FaPills className="me-2" /> Manage Medication
        </Link>
      </li>
      <li className="nav-item mb-2">
        <Link to="/userDashBoard/consumedChart" className="nav-link text-white">
          <FaChartLine className="me-2" /> Consumed Chart
        </Link>
      </li>
      <li className="nav-item mb-2">
        <Link to="/userDashBoard/ConsumedCount" className="nav-link text-white">
          <FaCheckCircle className="me-2" /> Consumed Count
        </Link>
      </li>
      <li className="nav-item mb-2">
        <Link to="/userDashBoard/mentalSupport" className="nav-link text-white">
          <FaBrain className="me-2" /> Ask AI for Mental Support
        </Link>
      </li>
      <li className="nav-item mb-2">
        <Link to="/userDashBoard/profile" className="nav-link text-white">
          <FaUser className="me-2" /> Profile
        </Link>
      </li>
      {role === "patient" && (
        <li className="nav-item mt-3">
          <button
            className={`btn ${alertStatus ? "btn-secondary" : "btn-warning"} w-100 fw-bold d-flex align-items-center justify-content-center gap-2`}
            disabled={alertStatus}
            onClick={handleAlert}
          >
            <FaBell /> {alertStatus ? "Alert Sent" : "Send Alert"}
          </button>
        </li>
      )}
      <li className="nav-item mt-auto">
        <button
          className="btn btn-danger w-100 fw-bold d-flex align-items-center justify-content-center mt-3 gap-2"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </button>
      </li>
    </ul>
  </div>

  {/* Main Content */}
  <div className="flex-grow-1 p-3 p-md-4" style={{ backgroundColor: "#ffffff" }}>
    <Outlet />
  </div>

  {/* (Your Modals stay unchanged) */}
  {role === "caretaker" && showAlertModal && (
    <div className="modal show fade" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-warning">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">⚠️ Patient Alert</h5>
          </div>
          <div className="modal-body">
            <p>Your associate patient has triggered an alert! Please contact immediately.</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-success" onClick={handleClearAlert}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* {showMissedModal && (
    <div className="modal show fade" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-danger">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">⚠️ Missed Medication Alert</h5>
          </div>
          <div className="modal-body">
            <p>The following tablets have not been taken on time:</p>
            <ul>
              {missedTablets.map((m, idx) => (
                <li key={idx}><strong>{m.tabletName}</strong> ({m.timing})</li>
              ))}
            </ul>
            <p className="text-danger fw-bold mb-0">Please take them immediately!</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowMissedModal(false)}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )} */}

  {showMissedModal && (
  <div
    className="modal show fade"
    style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content border-warning">
        <div className="modal-header bg-warning text-dark">
          <h5 className="modal-title">⏰ Reminder Medication Alert</h5>
        </div>
        <div className="modal-body">
          <p>The following tablets are pending for this time slot:</p>
          <ul>
            {missedTablets.map((m, idx) => (
              <li key={idx}>
                <strong>{m.tabletName}</strong> ({m.timing})
              </li>
            ))}
          </ul>
          <p className="text-danger fw-bold mb-0">
            Please take them as soon as possible!
          </p>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setShowMissedModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

</div>


  );
};

export default UserDashBoard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../App";
import {
  FaSave,
  FaEdit,
  FaUser,
  FaEnvelope,
  FaLock,
  FaStethoscope,
  FaHeartbeat,
  FaNotesMedical,
  FaUserCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";

const Profile = () => {
  const [patient, setPatient] = useState({
    name: "",
    email: "",
    password: "",
    description: "",
    bp: "",
    regularDoctor: "",
    careTakerEmail: "",
  });
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(sessionStorage.getItem("role") || "");
  const patientId = sessionStorage.getItem("pid");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const id = patientId || 1;
        const res = await axios.get(`${baseUrl}/getById/${id}`);
        setPatient(res.data);
        sessionStorage.setItem("pid", res.data.pid);
        setRole(sessionStorage.getItem("role") || res.data.role);
      } catch (err) {
        toast.error("Failed to fetch patient data!");
        console.error(err);
      }
    };
    fetchPatient();
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${baseUrl}/patients/update/${patient.pid}`, patient);
      toast.success("✅ Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      toast.error("❌ Error updating profile!");
      console.error(err);
    }
  };

  const canEdit = role === "caretaker";

  const inputStyle = {
    backgroundColor: "#F8FAFC",
    border: "1px solid #CBD5E1",
    borderRadius: "10px",
    color: "#0F2942",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  const labelStyle = {
    color: "#0F2942",
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "13px",
  };

  return (
    <div className="container py-2">
      {/* Page heading */}
      <div className="mb-4 d-flex align-items-center gap-2">
        <FaUserCircle size={22} style={{ color: "#06B6D4" }} />
        <h5
          className="mb-0 fw-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0F2942" }}
        >
          Patient Profile
        </h5>
        <span
          className="badge ms-1"
          style={{
            background: "rgba(6,182,212,0.12)",
            border: "1px solid rgba(6,182,212,0.3)",
            color: "#0891B2",
            fontSize: "10px",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {role?.toUpperCase()}
        </span>
      </div>

      <div
        className="bio-floating-window mx-auto p-0"
        style={{ maxWidth: "650px" }}
      >
        {/* Card top accent bar */}
        <div
          style={{
            height: "4px",
            background: "linear-gradient(90deg, #06B6D4 0%, #0891B2 100%)",
          }}
        />

        <div className="p-4 p-md-5">
          {/* Avatar */}
          <div className="text-center mb-4">
            <div
              className="mx-auto d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "88px",
                height: "88px",
                background: "linear-gradient(135deg, #0F2942 0%, #1E3A5F 100%)",
                border: "3px solid #06B6D4",
                boxShadow: "0 0 20px rgba(6,182,212,0.25)",
                fontSize: "42px",
                color: "#06B6D4",
              }}
            >
              <FaUserCircle />
            </div>
            <h4
              className="mt-3 mb-0 fw-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0F2942" }}
            >
              {patient.name || "—"}
            </h4>
            <span
              className="small"
              style={{ color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {patient.email}
            </span>
          </div>

          {/* Fields */}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label d-flex align-items-center gap-1" style={labelStyle}>
                <FaUser style={{ color: "#06B6D4" }} /> Name
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                style={inputStyle}
                value={patient.name}
                onChange={handleChange}
                disabled={!editing || !canEdit}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label d-flex align-items-center gap-1" style={labelStyle}>
                <FaEnvelope style={{ color: "#06B6D4" }} /> Email
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                style={inputStyle}
                value={patient.email}
                onChange={handleChange}
                disabled={!editing || !canEdit}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label d-flex align-items-center gap-1" style={labelStyle}>
                <FaLock style={{ color: "#06B6D4" }} /> Password
              </label>
              <input
                type="password"
                name="password"
                className="form-control"
                style={inputStyle}
                value={patient.password}
                onChange={handleChange}
                disabled={!editing || !canEdit}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label d-flex align-items-center gap-1" style={labelStyle}>
                <FaHeartbeat style={{ color: "#E11D48" }} /> Blood Pressure
              </label>
              <input
                type="text"
                name="bp"
                className="form-control"
                style={inputStyle}
                value={patient.bp}
                onChange={handleChange}
                disabled={!editing || !canEdit}
                placeholder="e.g. 120/80 mmHg"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label d-flex align-items-center gap-1" style={labelStyle}>
                <FaStethoscope style={{ color: "#0D9488" }} /> Regular Doctor
              </label>
              <input
                type="text"
                name="regularDoctor"
                className="form-control"
                style={inputStyle}
                value={patient.regularDoctor}
                onChange={handleChange}
                disabled={!editing || !canEdit}
                placeholder="e.g. Dr. Sharma"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label d-flex align-items-center gap-1" style={labelStyle}>
                <FaEnvelope style={{ color: "#D97706" }} /> Caretaker Email
              </label>
              <input
                type="email"
                name="careTakerEmail"
                className="form-control"
                style={inputStyle}
                value={patient.careTakerEmail}
                onChange={handleChange}
                disabled={!editing || !canEdit}
              />
            </div>

            <div className="col-12">
              <label className="form-label d-flex align-items-center gap-1" style={labelStyle}>
                <FaNotesMedical style={{ color: "#06B6D4" }} /> Medical Notes / Description
              </label>
              <textarea
                name="description"
                rows="3"
                className="form-control"
                style={{ ...inputStyle, resize: "vertical" }}
                value={patient.description}
                onChange={handleChange}
                disabled={!editing || !canEdit}
                placeholder="Any relevant medical history…"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="text-center mt-4">
            {editing ? (
              <button
                className="bio-btn-glow px-5 py-2"
                onClick={handleUpdate}
                disabled={!canEdit}
              >
                <FaSave className="me-2" /> Save Changes
              </button>
            ) : (
              <button
                className="bio-btn-glow px-5 py-2"
                onClick={() => setEditing(true)}
                disabled={!canEdit}
                style={!canEdit ? { opacity: 0.55, cursor: "not-allowed" } : {}}
              >
                <FaEdit className="me-2" /> Edit Profile
              </button>
            )}
            {!canEdit && (
              <p className="small mt-2 mb-0" style={{ color: "#64748B" }}>
                🔒 Only caretakers may edit this profile.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

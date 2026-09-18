import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { baseUrl } from "../App";

const ConsumedCount = () => {
  const [progressData, setProgressData] = useState([]);
  const [takenToday, setTakenToday] = useState(() => {
    const saved = localStorage.getItem('medicationTakenToday');
    return saved ? JSON.parse(saved) : {};
  });
  const patientId = sessionStorage.getItem("pid");

  useEffect(() => {
    localStorage.setItem('medicationTakenToday', JSON.stringify(takenToday));
  }, [takenToday]);

  const handleTakeMedication = (medicationName) => {
    const today = new Date().toDateString();
    setTakenToday(prev => ({
      ...prev,
      [medicationName]: today
    }));
    alert(`${medicationName} marked as taken today!`);
  };

  useEffect(() => {
    if (patientId) fetchConsumedData();
  }, [patientId]);

  const fetchConsumedData = async () => {
    try {
      const res = await axios.get(`${baseUrl}/consumed/bypatient/${patientId}`);
      processData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setProgressData([]);
    }
  };

  const processData = (data) => {
  if (!data || !Array.isArray(data)) {
    setProgressData([]);
    return;
  }

  const grouped = {};

  data.forEach((item) => {
    const med = item.medication;
    if (!med) return;

    const name = med.tableName || "Unknown";
    const qty = med.tabletQty || 1;
    const timing = med.timing || "Morning";
    const expire = med.expiryDate || "";

    if (!grouped[name]) {
      grouped[name] = {
        total: qty,
        consumed: 0,
        timing,
        expiryDate: expire, // ✅ store expiry
      };
    }

    grouped[name].consumed += 1;
  });

  const formatted = Object.keys(grouped).map((name) => {
    const { total, consumed, timing, expiryDate } = grouped[name];
    const percentage = Math.round((consumed / total) * 100);

    // 🔁 Badge logic
    const badges = [];
    if (consumed >= total * 0.33) badges.push("brown");
    if (consumed >= total * 0.66) badges.push("silver");
    if (consumed >= total * 0.93) badges.push("gold");

    // 🗓️ Expiry calculation
    let expiryMessage = "";
    if (expiryDate) {
      const today = new Date();
      const expDate = new Date(expiryDate);
      const diffTime = expDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        expiryMessage = `This tablet will expire in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
      } else if (diffDays === 0) {
        expiryMessage = "This tablet expires today";
      } else {
        expiryMessage = "This tablet has expired";
      }
    }

    return { name, total, consumed, timing, percentage, badges, expiryMessage };
  });

  setProgressData(formatted);
};


  const renderBadges = (badges) => {
    const badgeConfig = {
      brown: {
        label: "Bronze",
        color: "#8B4513",
        textColor: "#fff",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="currentColor"
            style={{ marginRight: "4px", verticalAlign: "middle" }}
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V20h2v-2h2v2h2v-4.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 1.66-.82 3.16-2.09 4.09l-.41.28-.5.13v-2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v2.5l-.5-.13-.41-.28C7.82 14.16 7 12.66 7 11c0-2.76 2.24-5 5-5z" />
          </svg>
        ),
      },
      silver: {
        label: "Silver",
        color: "#C0C0C0",
        textColor: "#222",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="currentColor"
            style={{ marginRight: "4px", verticalAlign: "middle" }}
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V20h2v-2h2v2h2v-4.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 1.66-.82 3.16-2.09 4.09l-.41.28-.5.13v-2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v2.5l-.5-.13-.41-.28C7.82 14.16 7 12.66 7 11c0-2.76 2.24-5 5-5z" />
          </svg>
        ),
      },
      gold: {
        label: "Gold",
        color: "#FFD700",
        textColor: "#222",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="currentColor"
            style={{ marginRight: "4px", verticalAlign: "middle" }}
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V20h2v-2h2v2h2v-4.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 1.66-.82 3.16-2.09 4.09l-.41.28-.5.13v-2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v2.5l-.5-.13-.41-.28C7.82 14.16 7 12.66 7 11c0-2.76 2.24-5 5-5z" />
          </svg>
        ),
      },
    };

    return (
      <div className="d-flex justify-content-center flex-wrap gap-1 mb-2">
        {badges.map((type, i) => {
          const config = badgeConfig[type];
          return (
            <span
              key={i}
              style={{
                padding: "5px 10px",
                borderRadius: "20px",
                backgroundColor: config.color,
                color: config.textColor,
                fontSize: "0.75rem",
                fontWeight: "bold",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "72px",
              }}
            >
              {config.icon}
              {config.label}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4">Medication Consumption Progress</h3>

      {progressData.length > 0 ? (
        <div className="d-flex flex-wrap justify-content-center gap-4">
          {progressData.map((item, index) => (
            <div
              key={index}
              className="text-center p-3 rounded-3"
              style={{
                width: "220px",
                background: "#ffffff",
                border: "1px solid #eee",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                borderRadius: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.04)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
              }}
            >
              {/* ✅ Badges with icons at the TOP */}
              {item.badges.length > 0 && renderBadges(item.badges)}

              {/* Progress Circle */}
              <div style={{ width: "110px", height: "110px", margin: "0 auto" }}>
                <CircularProgressbar
                  value={item.percentage}
                  text={`${item.consumed}/${item.total}`}
                  styles={buildStyles({
                    textSize: "16px",
                    pathColor:
                      item.percentage >= 80
                        ? "#28a745"
                        : item.percentage >= 40
                        ? "#ffc107"
                        : "#dc3545",
                    textColor: "#333",
                    trailColor: "#f5f5f5",
                  })}
                />
              </div>
              
              {/* Medication Info */}
              <h5 className="mt-3 mb-1" style={{ color: '#2c3e50', fontSize: '1.1rem' }}>
                {item.name}
              </h5>
              <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                {item.timing}
              </p>
              {item.expiryMessage && (
                <p className="mb-2" style={{ 
                  color: item.expiryMessage.includes('expired') ? '#dc3545' : '#6c757d',
                  fontSize: '0.8rem',
                  fontWeight: 500
                }}>
                  {item.expiryMessage}
                </p>
              )}
              <button
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={() => handleTakeMedication(item.name)}
                disabled={new Date().toDateString() === takenToday[item.name]}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  transition: 'all 0.2s',
                  opacity: new Date().toDateString() === takenToday[item.name] ? 0.6 : 1
                }}
              >
                {new Date().toDateString() === takenToday[item.name] 
                  ? 'Taken Today' 
                  : 'Mark as Taken'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4">
          <p className="text-muted">No medication data available</p>
        </div>
      )}
    </div>
  );
};

export default ConsumedCount;
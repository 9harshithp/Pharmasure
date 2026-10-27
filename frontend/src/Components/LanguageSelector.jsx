import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { FaGlobe } from "react-icons/fa";

const LanguageSelector = ({ variant = "light" }) => {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isDark = variant === "dark";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (code) => {
    setIsOpen(false);
    await changeLanguage(code);
  };

  return (
    <div className="dropdown d-inline-block position-relative" ref={dropdownRef}>
      <button
        className={`btn btn-sm dropdown-toggle d-flex align-items-center gap-2 fw-semibold ${
          isDark
            ? "btn-outline-light"
            : "btn-outline-primary bg-white text-primary border"
        }`}
        type="button"
        id="languageDropdown"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        style={{ borderRadius: "20px", padding: "5px 14px", cursor: "pointer" }}
      >
        <FaGlobe />
        <span>
          {supportedLanguages.find((l) => l.code === currentLanguage)?.nativeName || "English"}
        </span>
      </button>
      <ul
        className={`dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-1 py-1 ${isOpen ? "show" : ""}`}
        aria-labelledby="languageDropdown"
        style={{
          minWidth: "170px",
          display: isOpen ? "block" : "none",
          position: "absolute",
          right: 0,
          top: "100%",
          zIndex: 1050
        }}
      >
        {supportedLanguages.map((lang) => (
          <li key={lang.code}>
            <button
              className={`dropdown-item d-flex align-items-center justify-content-between py-2 px-3 ${
                currentLanguage === lang.code ? "active fw-bold bg-primary text-white" : ""
              }`}
              type="button"
              onClick={() => handleSelect(lang.code)}
            >
              <span className="fw-medium">{lang.nativeName}</span>
              <small className={currentLanguage === lang.code ? "text-white-50 ms-2" : "text-muted ms-2"}>
                {lang.name}
              </small>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageSelector;

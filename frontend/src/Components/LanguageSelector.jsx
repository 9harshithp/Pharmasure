import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { FaGlobe } from "react-icons/fa";

const LanguageSelector = ({ variant = "light" }) => {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();

  const isDark = variant === "dark";

  return (
    <div className="dropdown d-inline-block">
      <button
        className={`btn btn-sm dropdown-toggle d-flex align-items-center gap-2 fw-semibold ${
          isDark
            ? "btn-outline-light"
            : "btn-outline-primary bg-white text-primary border"
        }`}
        type="button"
        id="languageDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{ borderRadius: "20px", padding: "5px 14px" }}
      >
        <FaGlobe />
        <span>
          {supportedLanguages.find((l) => l.code === currentLanguage)?.nativeName || "English"}
        </span>
      </button>
      <ul
        className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-1 py-1"
        aria-labelledby="languageDropdown"
        style={{ minWidth: "170px" }}
      >
        {supportedLanguages.map((lang) => (
          <li key={lang.code}>
            <button
              className={`dropdown-item d-flex align-items-center justify-content-between py-2 px-3 ${
                currentLanguage === lang.code ? "active fw-bold bg-primary" : ""
              }`}
              type="button"
              onClick={() => changeLanguage(lang.code)}
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

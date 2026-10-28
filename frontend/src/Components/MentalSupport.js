import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../App";
import { toast } from "react-toastify";
import { FaBrain, FaExternalLinkAlt, FaCog, FaPaperPlane, FaTrashAlt } from "react-icons/fa";
import { GoogleGenAI } from "@google/genai";
import { getStoredGeminiKey } from "../utils/ocrScanner";
import { generateWellnessResponse } from "../utils/wellnessEngine";
import AISettingsModal from "./AISettingsModal";

const MentalSupport = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeEngine, setActiveEngine] = useState("Offline Clinical");
  const patientId = sessionStorage.getItem("pid");

  useEffect(() => {
    const key = getStoredGeminiKey();
    setActiveEngine(key ? "Gemini Cloud AI" : "Offline Clinical");

    setResources([
      {
        type: "video",
        title: "Meditation for Stress Relief",
        link: "https://www.youtube.com/watch?v=inpok4MKVLM",
      },
      {
        type: "podcast",
        title: "Mental Health Tips",
        link: "https://www.listennotes.com/podcast/mental-health-tips-12345/",
      },
      {
        type: "video",
        title: "Relaxing Music for Sleep",
        link: "https://www.youtube.com/watch?v=2OEL4P1Rz04",
      },
    ]);
  }, []);

  const sendQuery = async (queryText) => {
    const userQuery = (queryText || prompt).trim();
    if (!userQuery) return;

    const userMessage = { role: "user", text: userQuery };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    const geminiKey = getStoredGeminiKey();
    let replyText = "";

    // Tier 1: Try Direct Gemini API (if key is configured in browser/localStorage)
    if (geminiKey) {
      try {
        const genAI = new GoogleGenAI({ apiKey: geminiKey });
        const candidateModels = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.5-flash"];

        for (const model of candidateModels) {
          try {
            const res = await genAI.models.generateContent({
              model: model,
              contents: userQuery,
              config: {
                systemInstruction:
                  "You are the empathetic, warm, and highly knowledgeable Mental Support & Health Assistant for PharmaSure. " +
                  "Provide compassionate psychological support, stress relief methods, sleep hygiene, and safe medication adherence tips. " +
                  "Use clear, well-structured markdown with bullet points and friendly encouraging tone. Never recommend altering prescription dosages without consulting a physician.",
              },
            });
            if (res?.text) {
              replyText = res.text;
              break;
            }
          } catch (mErr) {
            console.warn(`Direct Gemini ${model} failed:`, mErr.message || mErr);
          }
        }
      } catch (geminiErr) {
        console.warn("Direct Gemini invocation failed, trying backend:", geminiErr);
      }
    }

    // Tier 2: Try Backend API if Direct Gemini didn't answer
    if (!replyText) {
      try {
        const res = await axios.post(
          `${baseUrl}/api/gemini/medication/ask`,
          {
            prompt: userQuery,
            pid: patientId || "1",
          },
          { timeout: 7000 }
        );

        if (res?.data?.aiResponse && !res.data.aiResponse.includes("Error fetching AI response")) {
          replyText = res.data.aiResponse;
        }
      } catch (backendErr) {
        console.warn("Backend /api/gemini/medication/ask unavailable or 500, falling back to local engine:", backendErr);
      }
    }

    // Tier 3: Seamless Built-in Clinical Mental Support & Wellness Engine (NEVER FAILS)
    if (!replyText) {
      replyText = generateWellnessResponse(userQuery);
    }

    const aiMessage = {
      role: "ai",
      text: replyText,
    };

    setMessages((prev) => [...prev, aiMessage]);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuery();
  };

  const handleChipClick = (suggestion) => {
    sendQuery(suggestion);
  };

  const clearChat = () => {
    setMessages([]);
    toast.info("Chat cleared!");
  };

  // Basic formatting helper for markdown bolding, headers, and bullet points
  const formatMessageText = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      let trimmed = line.trim();

      // Headers (### or ####)
      if (trimmed.startsWith("### ")) {
        return (
          <h6 key={lineIdx} className="fw-bold mt-2 mb-1" style={{ color: "#0F2942" }}>
            {trimmed.replace(/^###\s+/, "")}
          </h6>
        );
      }
      if (trimmed.startsWith("#### ")) {
        return (
          <div key={lineIdx} className="fw-semibold mt-2 mb-1" style={{ color: "#0891B2", fontSize: "13px" }}>
            {trimmed.replace(/^####\s+/, "")}
          </div>
        );
      }

      // Bullet points
      const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ") || /^\d+\.\s+/.test(trimmed);
      let content = isBullet ? trimmed.replace(/^(\*|-|\d+\.)\s+/, "") : line;

      // Inline link replacement
      const parts = content.split(urlRegex).map((part, i) =>
        part.match(urlRegex) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#06B6D4", textDecoration: "underline" }}
          >
            {part}
          </a>
        ) : (
          part
        )
      );

      return (
        <div
          key={lineIdx}
          className={`${isBullet ? "ps-3 mb-1 position-relative" : "mb-1"}`}
          style={{ lineHeight: "1.5" }}
        >
          {isBullet && (
            <span
              style={{
                position: "absolute",
                left: "4px",
                top: "2px",
                color: "#06B6D4",
                fontWeight: "bold",
              }}
            >
              •
            </span>
          )}
          {parts}
        </div>
      );
    });
  };

  const promptSuggestions = [
    { label: "🧘 Panic / Anxiety Relief", text: "I feel very anxious right now, can you guide me through calming down?" },
    { label: "💊 Missed a Medication?", text: "What should I do if I forgot to take my morning medicine?" },
    { label: "😴 Insomnia & Sleep Help", text: "I cannot fall asleep tonight. What can I do to sleep better?" },
    { label: "🌬️ 4-7-8 Breathing Guide", text: "Can you teach me the 4-7-8 breathing method for quick relaxation?" },
    { label: "📞 Crisis Helpline Contacts", text: "Can you provide emergency mental health helpline phone numbers?" },
  ];

  return (
    <div className="container py-2">
      {/* Page heading */}
      <div className="mb-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-2">
          <FaBrain size={24} style={{ color: "#06B6D4" }} />
          <div>
            <h5
              className="mb-0 fw-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0F2942" }}
            >
              Mental Support & Wellness
            </h5>
            <div className="text-muted" style={{ fontSize: "12px" }}>
              Empathetic AI support for anxiety, sleep, stress & medication safety
            </div>
          </div>
        </div>

        {/* Engine status & AI Settings Button */}
        <div className="d-flex align-items-center gap-2">
          <span
            className="badge d-flex align-items-center gap-1"
            style={{
              background: activeEngine.includes("Gemini") ? "rgba(34,197,94,0.12)" : "rgba(6,182,212,0.12)",
              border: `1px solid ${activeEngine.includes("Gemini") ? "rgba(34,197,94,0.3)" : "rgba(6,182,212,0.3)"}`,
              color: activeEngine.includes("Gemini") ? "#15803D" : "#0891B2",
              fontSize: "11px",
              padding: "6px 10px",
              borderRadius: "20px",
            }}
          >
            <span
              className="rounded-circle"
              style={{
                width: "7px",
                height: "7px",
                background: activeEngine.includes("Gemini") ? "#22C55E" : "#06B6D4",
                display: "inline-block",
              }}
            />
            {activeEngine.includes("Gemini") ? "Gemini Live AI" : "Clinical Offline AI"}
          </span>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 shadow-sm"
            style={{ borderRadius: "8px", fontSize: "12px", fontWeight: 600 }}
            onClick={() => setShowConfigModal(true)}
            title="Configure Gemini API Key"
          >
            <FaCog size={13} style={{ color: "#06B6D4" }} />
            <span>AI Settings</span>
          </button>
        </div>
      </div>

      {/* Chat Box */}
      <div className="pharma-chat-box mb-4 shadow-sm" style={{ minHeight: "440px" }}>
        {/* Header */}
        <div className="pharma-chat-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span
              className="rounded-circle"
              style={{
                width: "10px",
                height: "10px",
                background: "#22C55E",
                display: "inline-block",
                boxShadow: "0 0 6px rgba(34,197,94,0.5)",
              }}
            />
            <span
              className="fw-semibold"
              style={{
                color: "#0F2942",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "14px",
              }}
            >
              PharmaSure Wellness Assistant
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            {messages.length > 0 && (
              <button
                className="btn btn-sm d-flex align-items-center gap-1"
                style={{
                  background: "rgba(225,29,72,0.08)",
                  border: "1px solid rgba(225,29,72,0.2)",
                  color: "#E11D48",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
                onClick={clearChat}
              >
                <FaTrashAlt size={10} />
                <span>Clear Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="pharma-chat-messages" style={{ minHeight: "280px", maxHeight: "420px" }}>
          {messages.length === 0 && (
            <div className="text-center my-auto py-4 px-3">
              <FaBrain size={36} style={{ color: "#94A3B8", marginBottom: "12px" }} />
              <h6 className="fw-bold mb-1" style={{ color: "#1E293B" }}>
                How can we support you today?
              </h6>
              <p className="small mb-3" style={{ color: "#64748B", maxWidth: "460px", margin: "0 auto" }}>
                Ask anything about anxiety, stress relief, insomnia, mindfulness, or what to do if you missed a pill.
              </p>

              {/* Quick suggestions */}
              <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                {promptSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-sm text-start"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "16px",
                      fontSize: "12px",
                      color: "#0F2942",
                      fontWeight: 500,
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => handleChipClick(item.text)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#06B6D4";
                      e.currentTarget.style.backgroundColor = "rgba(6, 182, 212, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#CBD5E1";
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={
                msg.role === "user"
                  ? "pharma-chat-bubble-user"
                  : "pharma-chat-bubble-ai"
              }
              style={{
                maxWidth: msg.role === "user" ? "80%" : "90%",
                fontSize: "14px",
              }}
            >
              {formatMessageText(msg.text)}
            </div>
          ))}

          {loading && (
            <div className="pharma-chat-bubble-ai d-flex align-items-center gap-2 py-3 px-3">
              <span className="small text-muted me-1">Assistant is typing</span>
              <span className="pharma-typing-dot" />
              <span className="pharma-typing-dot" />
              <span className="pharma-typing-dot" />
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="pharma-chat-input-bar">
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #CBD5E1",
                borderRadius: "10px",
                color: "#0F2942",
                fontSize: "14px",
              }}
              placeholder="Ask about stress, anxiety, sleep, or medication…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              required
            />
            <button
              className="bio-btn-glow px-4 d-flex align-items-center gap-2"
              type="submit"
              disabled={loading || !prompt.trim()}
              style={{ whiteSpace: "nowrap", minWidth: "90px" }}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm" role="status" />
                  <span>Thinking</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <FaPaperPlane size={11} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Prompt Pill Carousel Bar */}
      {messages.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
          <span className="small text-muted fw-semibold" style={{ fontSize: "12px" }}>
            Suggested:
          </span>
          {promptSuggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-sm"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
                fontSize: "11px",
                color: "#334155",
                fontWeight: 500,
              }}
              onClick={() => handleChipClick(item.text)}
              disabled={loading}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Recommended Audio & Video Resources */}
      <div className="bio-floating-window p-4 shadow-sm">
        <h6
          className="fw-bold mb-3 d-flex align-items-center gap-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0F2942" }}
        >
          🎧 Recommended Videos & Podcasts
        </h6>
        <div className="d-flex flex-column gap-2">
          {resources.map((res, idx) => (
            <a
              key={idx}
              href={res.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none d-flex justify-content-between align-items-center p-3 rounded-3"
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                color: "#0F2942",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#06B6D4";
                e.currentTarget.style.background = "rgba(6,182,212,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.background = "#F8FAFC";
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 500 }}>{res.title}</span>
              <div className="d-flex align-items-center gap-2">
                <span
                  className="badge"
                  style={{
                    background: res.type === "video" ? "rgba(6,182,212,0.12)" : "rgba(13,148,136,0.12)",
                    color: res.type === "video" ? "#0891B2" : "#0D9488",
                    border: `1px solid ${res.type === "video" ? "rgba(6,182,212,0.3)" : "rgba(13,148,136,0.3)"}`,
                    fontSize: "10px",
                  }}
                >
                  {res.type === "video" ? "🎥 Video" : "🎧 Podcast"}
                </span>
                <FaExternalLinkAlt size={10} style={{ color: "#94A3B8" }} />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onKeyUpdated={(key) => {
          setActiveEngine(key ? "Gemini Cloud AI" : "Offline Clinical");
        }}
      />
    </div>
  );
};

export default MentalSupport;

"use client";

import { useState } from "react";

interface FormData {
  companyName: string;
  domain: string;
  recipientEmail: string;
  aeName: string;
  aeEmail: string;
  aePhone: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  companyName?: string;
  recipientEmail?: string;
  htmlPreview?: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    companyName: "Nike",
    domain: "nike.com",
    recipientEmail: "test@example.com",
    aeName: "Name",
    aeEmail: "email@test.com",
    aePhone: "+1-234-0100",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/generate-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await res.json();
      setResponse(data);
      setShowResult(true);
    } catch (error) {
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : "Request failed",
      });
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowResult(false);
    setResponse(null);
  };

  // Result View with PDF Preview
  if (showResult && response) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "24px 16px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              padding: "24px 32px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {response.success ? (
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#10b981",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              ) : (
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#ef4444",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
              )}
              <div>
                <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827", margin: 0 }}>
                  {response.success ? "Gift Guide Sent Successfully!" : "Something Went Wrong"}
                </h1>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0 0" }}>
                  {response.success ? (
                    <>
                      <strong>{response.companyName}</strong> → {response.recipientEmail}
                    </>
                  ) : (
                    response.error
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                fontWeight: "600",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Generate Another Guide
            </button>
          </div>

          {/* PDF Preview */}
          {response.success && response.htmlPreview && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                }}
              >
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#374151", margin: 0 }}>
                  PDF Preview
                </h2>
              </div>
              <div
                style={{
                  padding: "24px",
                  backgroundColor: "#e5e7eb",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <iframe
                  srcDoc={response.htmlPreview}
                  style={{
                    width: "816px",
                    height: "1056px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    backgroundColor: "white",
                    transform: "scale(0.7)",
                    transformOrigin: "top center",
                  }}
                  title="PDF Preview"
                />
              </div>
            </div>
          )}

          {/* Error State - No Preview */}
          {!response.success && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                padding: "48px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "12px",
                  padding: "24px",
                  maxWidth: "500px",
                  margin: "0 auto",
                }}
              >
                <p style={{ fontSize: "14px", color: "#991b1b", margin: 0 }}>{response.error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Form View
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "48px 16px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            padding: "32px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#111827", marginBottom: "8px" }}>
              Gift Guide Generator
            </h1>
            <p style={{ color: "#6b7280" }}>Generate and email a branded PDF gift guide</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                  Domain
                </label>
                <input
                  type="text"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                Recipient Email
              </label>
              <input
                type="email"
                name="recipientEmail"
                value={formData.recipientEmail}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px", marginTop: "24px", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#374151", marginBottom: "16px" }}>
                Account Executive Info
              </h2>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                  AE Name
                </label>
                <input
                  type="text"
                  name="aeName"
                  value={formData.aeName}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                    AE Email
                  </label>
                  <input
                    type="email"
                    name="aeEmail"
                    value={formData.aeEmail}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
                    AE Phone
                  </label>
                  <input
                    type="tel"
                    name="aePhone"
                    value={formData.aePhone}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                backgroundColor: isLoading ? "#93c5fd" : "#2563eb",
                color: "white",
                fontWeight: "600",
                padding: "16px 24px",
                borderRadius: "8px",
                border: "none",
                fontSize: "16px",
                cursor: isLoading ? "not-allowed" : "pointer",
                marginTop: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isLoading ? (
                <>
                  <svg
                    style={{ animation: "spin 1s linear infinite", width: "20px", height: "20px" }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      style={{ opacity: 0.75 }}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating PDF & Sending Email...
                </>
              ) : (
                "Generate & Send Gift Guide"
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", marginTop: "24px" }}>
          Logos provided by apistemic logos API
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

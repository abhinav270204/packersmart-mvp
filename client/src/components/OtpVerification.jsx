import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { leadApi } from "../services/api";
import CompanyMatches from "./CompanyMatches";

function OtpVerification({ leadId, initialLead = null, onVerified = null }) {
  const [lead, setLead] = useState(initialLead);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successResult, setSuccessResult] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [resendNotification, setResendNotification] = useState("");

  const inputRefs = useRef([]);

  useEffect(() => {
    let isMounted = true;
    if (leadId) {
      leadApi
        .getLeadById(leadId)
        .then((res) => {
          if (isMounted && res.success && res.lead) {
            setLead(res.lead);
            if (res.lead.status === "VERIFIED") {
              const resultObj = {
                lead: res.lead,
                scoringBreakdown: res.scoringBreakdown,
                matchedCompanies: res.lead.companyMatches?.map((m) => ({
                  ...m.company,
                  matchScore: m.matchScore,
                  matchReasons: [
                    `Coverage match score: ${m.matchScore}%`,
                    `Route and service compatibility verified`
                  ]
                }))
              };
              setSuccessResult(resultObj);
              if (onVerified) onVerified(resultObj);
            }
          }
        })
        .catch(() => {
          if (isMounted) setErrorMessage("Unable to load quote details.");
        });
    }
    return () => {
      isMounted = false;
    };
  }, [leadId]);

  useEffect(() => {
    if (successResult || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining, successResult]);

  useEffect(() => {
    if (inputRefs.current[0] && !successResult) {
      inputRefs.current[0].focus();
    }
  }, [successResult]);

  const handleDigitChange = (index, value) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setErrorMessage("");

    if (char && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join("");

    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the OTP.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const res = await leadApi.verifyOtp(leadId, fullOtp);
      if (res.success) {
        setSuccessResult(res);
        setLead(res.lead);
        if (onVerified) onVerified(res);
      } else {
        setErrorMessage(res.message || "OTP verification failed.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setErrorMessage(
        err.response?.data?.message || "Invalid or expired OTP. Please check the backend console."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMessage("");
    setResendNotification("");
    try {
      const res = await leadApi.resendOtp(leadId);
      if (res.success) {
        setOtpDigits(["", "", "", "", "", ""]);
        setSecondsRemaining(600);
        setResendNotification("A new OTP code has been generated and logged in backend terminal.");
        setTimeout(() => setResendNotification(""), 5000);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error("Resend error:", err);
      setErrorMessage(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (successResult) {
    const verifiedLead = successResult.lead || lead;
    const quality = verifiedLead.leadQuality || "HOT";
    const score = verifiedLead.leadScore || 0;
    const breakdown = successResult.scoringBreakdown || {};

    return (
      <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "var(--radius-pill)",
              background: "var(--status-verified-bg)",
              color: "var(--status-verified-text)",
              fontSize: "1.25rem",
              fontWeight: "700",
              marginBottom: "8px"
            }}
          >
            ✓
          </div>
          <h2 style={{ fontSize: "1.4rem" }}>Quote Verified</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "2px" }}>
            Lead #{verifiedLead.id} for {verifiedLead.customerName}
          </p>
        </div>

        {/* Lead Quality Section */}
        <div
          style={{
            background: "var(--bg-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            marginBottom: "20px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`quality-pill quality-${quality.toLowerCase()}`}>
                {quality} LEAD
              </span>
              <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                {score} / 100
              </span>
            </div>

            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              {verifiedLead.pickupCity} → {verifiedLead.destinationCity} ({verifiedLead.serviceType})
            </div>
          </div>

          <div className="quality-bar-bg" style={{ marginBottom: "10px" }}>
            <div
              className="quality-bar-fill"
              style={{
                width: `${score}%`,
                background: quality === "HOT" ? "#dc2626" : quality === "WARM" ? "#d97706" : "#2563eb"
              }}
            />
          </div>

          {breakdown && Object.keys(breakdown).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {breakdown.otpVerified > 0 && (
                <span className="tag-item">OTP Verified (+{breakdown.otpVerified})</span>
              )}
              {breakdown.movingUrgency > 0 && (
                <span className="tag-item">Timeline Urgency (+{breakdown.movingUrgency})</span>
              )}
              {breakdown.contactValidity > 0 && (
                <span className="tag-item">Valid Contacts (+{breakdown.contactValidity})</span>
              )}
              {breakdown.routeScope > 0 && (
                <span className="tag-item">Route Scope (+{breakdown.routeScope})</span>
              )}
              {breakdown.serviceType > 0 && (
                <span className="tag-item">Service Type (+{breakdown.serviceType})</span>
              )}
            </div>
          )}
        </div>

        {/* Matched Companies */}
        <CompanyMatches companies={successResult.matchedCompanies || []} />

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <Link to="/admin" className="btn btn-primary" style={{ flex: 1 }}>
            View in Admin Dashboard
          </Link>
          <Link to="/" className="btn btn-secondary" style={{ flex: 1 }}>
            Request Another Quote
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card otp-container">
      <h2 style={{ fontSize: "1.35rem" }}>Verify Mobile Number</h2>
      <p className="card-description">
        Enter the 6-digit OTP code sent for Lead #{leadId}
        {lead?.mobile && ` (+91 ${lead.mobile})`}.
      </p>

      {resendNotification && (
        <div className="alert alert-info">
          <div>{resendNotification}</div>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <div>{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleVerify}>
        <div className="otp-inputs-grid" onPaste={handlePaste}>
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="otp-digit-input"
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              required
            />
          ))}
        </div>

        <div className="otp-countdown">
          {secondsRemaining > 0 ? (
            <span>Code expires in: <strong>{formatTimer(secondsRemaining)}</strong></span>
          ) : (
            <span style={{ color: "#dc2626" }}>OTP has expired. Please request a new code.</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isVerifying || otpDigits.join("").length !== 6}
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={handleResendOtp}
            disabled={isResending}
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OtpVerification;

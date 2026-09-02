import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import OtpVerification from "../components/OtpVerification";

function VerifyOtp() {
  const { leadId } = useParams();
  const location = useLocation();

  const initialLead = location.state?.lead || null;
  const [isVerified, setIsVerified] = useState(initialLead?.status === "VERIFIED");

  return (
    <div>
      <header className="hero-header">
        <h1 className="hero-title">
          {isVerified ? "Matched Logistics Partners" : "Verify Your Mobile Number"}
        </h1>
        <p className="hero-subtitle">
          {isVerified
            ? "Your relocation quote has been verified. Below are your top matched moving companies and lead quality analysis."
            : "Ensure high-quality quote matching by verifying your 6-digit authentication code."}
        </p>

        {/* Stepper */}
        <div className="stepper-container">
          <div className="step-item completed">
            <div className="step-circle">✓</div>
            <span>Quote Details</span>
          </div>
          <div className="step-divider" />
          <div className={`step-item ${isVerified ? "completed" : "active"}`}>
            <div className="step-circle">{isVerified ? "✓" : "2"}</div>
            <span>OTP Verification</span>
          </div>
          <div className="step-divider" />
          <div className={`step-item ${isVerified ? "active" : ""}`}>
            <div className="step-circle">3</div>
            <span>Matched Movers</span>
          </div>
        </div>
      </header>

      <OtpVerification
        leadId={leadId}
        initialLead={initialLead}
        onVerified={() => setIsVerified(true)}
      />
    </div>
  );
}

export default VerifyOtp;

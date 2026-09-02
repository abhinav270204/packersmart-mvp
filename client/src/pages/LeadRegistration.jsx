import React from "react";
import LeadForm from "../components/LeadForm";

function LeadRegistration() {
  return (
    <div>
      <header className="hero-header">
        <h1 className="hero-title">Request a Verified Moving Quote</h1>
        <p className="hero-subtitle">
          Submit your relocation requirements in seconds. We verify your quote, analyze lead quality, and instantly connect you with top-rated packers & movers.
        </p>

        {/* Stepper */}
        <div className="stepper-container">
          <div className="step-item active">
            <div className="step-circle">1</div>
            <span>Quote Details</span>
          </div>
          <div className="step-divider" />
          <div className="step-item">
            <div className="step-circle">2</div>
            <span>OTP Verification</span>
          </div>
          <div className="step-divider" />
          <div className="step-item">
            <div className="step-circle">3</div>
            <span>Matched Movers</span>
          </div>
        </div>
      </header>

      <LeadForm />
    </div>
  );
}

export default LeadRegistration;

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { leadApi } from "../services/api";
import CompanyMatches from "./CompanyMatches";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
  { value: "FAKE", label: "Fake" },
  { value: "DUPLICATE", label: "Duplicate" },
  { value: "RE_ATTEMPT", label: "Re-Attempt" }
];

function LeadDetails() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [breakdown, setBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [message, setMessage] = useState("");

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const res = await leadApi.getLeadById(id);
      if (res.success && res.lead) {
        setLead(res.lead);
        setBreakdown(res.scoringBreakdown || {});
      }
    } catch (err) {
      console.error("Failed to load lead:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLeadDetails();
    }
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    setMessage("");
    try {
      const res = await leadApi.updateLeadStatus(id, newStatus);
      if (res.success) {
        setMessage(`Status updated to ${newStatus}`);
        setLead(res.lead);
        setTimeout(() => setMessage(""), 3500);
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Loading lead details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <h3>Lead Not Found</h3>
        <p style={{ color: "var(--text-muted)", margin: "8px 0 16px", fontSize: "0.875rem" }}>
          No record found for Lead #{id}.
        </p>
        <Link to="/admin" className="btn btn-primary">
          Back to Admin Dashboard
        </Link>
      </div>
    );
  }

  const quality = lead.leadQuality || "COLD";
  const score = lead.leadScore || 0;

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <Link to="/admin" style={{ color: "var(--primary-600)", fontWeight: "500", fontSize: "0.8125rem" }}>
            ← Back to Leads Queue
          </Link>
          <h1 style={{ fontSize: "1.5rem", marginTop: "4px" }}>
            Lead #{lead.id}: {lead.customerName}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Status:
          </label>
          <select
            className="form-select"
            style={{ width: "auto", fontSize: "0.8125rem", padding: "5px 28px 5px 10px" }}
            value={lead.status}
            disabled={updatingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          <div>{message}</div>
        </div>
      )}

      <div className="lead-detail-layout">
        {/* Left Column */}
        <div className="card">
          <h3 className="detail-section-title">Customer & Move Specifications</h3>

          <div className="detail-item-row">
            <span className="detail-item-label">Customer Name</span>
            <span className="detail-item-value">{lead.customerName}</span>
          </div>

          <div className="detail-item-row">
            <span className="detail-item-label">Mobile Number</span>
            <span className="detail-item-value">+91 {lead.mobile}</span>
          </div>

          <div className="detail-item-row">
            <span className="detail-item-label">Email Address</span>
            <span className="detail-item-value">{lead.email}</span>
          </div>

          <div className="detail-item-row">
            <span className="detail-item-label">Pickup City</span>
            <span className="detail-item-value">{lead.pickupCity}</span>
          </div>

          <div className="detail-item-row">
            <span className="detail-item-label">Destination City</span>
            <span className="detail-item-value">{lead.destinationCity}</span>
          </div>

          <div className="detail-item-row">
            <span className="detail-item-label">Service Type</span>
            <span className="detail-item-value">{lead.serviceType}</span>
          </div>

          <div className="detail-item-row">
            <span className="detail-item-label">Moving Date</span>
            <span className="detail-item-value">
              {new Date(lead.movingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          <div className="detail-item-row">
            <span className="detail-item-label">Created At</span>
            <span className="detail-item-value">
              {new Date(lead.createdAt).toLocaleString("en-IN")}
            </span>
          </div>

          <div style={{ marginTop: "14px" }}>
            <span className="detail-item-label" style={{ display: "block", marginBottom: "4px" }}>
              Additional Requirements:
            </span>
            <div style={{ background: "var(--bg-subtle)", padding: "10px 12px", borderRadius: "var(--radius-md)", fontSize: "0.8125rem" }}>
              {lead.additionalRequirements || "None specified."}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card">
            <h3 className="detail-section-title">Lead Quality Analysis</h3>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span className={`quality-pill quality-${quality.toLowerCase()}`}>
                {quality} LEAD
              </span>
              <span style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                {score} / 100
              </span>
            </div>

            <div className="quality-bar-bg" style={{ marginBottom: "12px" }}>
              <div
                className="quality-bar-fill"
                style={{
                  width: `${score}%`,
                  background: quality === "HOT" ? "#dc2626" : quality === "WARM" ? "#d97706" : "#2563eb"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8125rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>OTP Verification</span>
                <strong>+{breakdown.otpVerified || (lead.status === "VERIFIED" ? 20 : 0)} pts</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Timeline Urgency</span>
                <strong>+{breakdown.movingUrgency || 0} pts</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Contact Completeness</span>
                <strong>+{breakdown.contactValidity || 0} pts</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Route Scope</span>
                <strong>+{breakdown.routeScope || 0} pts</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Scope Requirements</span>
                <strong>+{breakdown.requirementsDetail || 0} pts</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Service Category</span>
                <strong>+{breakdown.serviceType || 0} pts</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="detail-section-title">OTP Audit Trail</h3>
            {lead.otpVerifications && lead.otpVerifications.length > 0 ? (
              lead.otpVerifications.map((otpRec, idx) => (
                <div key={otpRec.id || idx} className="detail-item-row" style={{ alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.8125rem" }}>
                      OTP: {otpRec.otp}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Expires: {new Date(otpRec.expiresAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div>
                    {otpRec.verifiedAt ? (
                      <span className="badge badge-verified">
                        Verified
                      </span>
                    ) : (
                      <span className="badge badge-pending">Pending</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>No OTP records logged.</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <div className="card">
          <CompanyMatches
            companies={
              lead.companyMatches?.map((m) => ({
                ...m.company,
                matchScore: m.matchScore,
                matchReasons: [
                  `Match Score: ${m.matchScore}%`,
                  `Route coverage and service types validated`
                ]
              })) || []
            }
          />
        </div>
      </div>
    </div>
  );
}

export default LeadDetails;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { leadApi } from "../services/api";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
  { value: "FAKE", label: "Fake" },
  { value: "DUPLICATE", label: "Duplicate" },
  { value: "RE_ATTEMPT", label: "Re-Attempt" }
];

function LeadTable({
  leads = [],
  loading = false,
  onStatusUpdated = () => {},
  onFilterChange = () => {},
  filters = { status: "ALL", quality: "ALL", search: "" }
}) {
  const [updatingId, setUpdatingId] = useState(null);
  const [statusNotification, setStatusNotification] = useState("");

  const handleStatusChange = async (leadId, newStatus) => {
    setUpdatingId(leadId);
    try {
      const res = await leadApi.updateLeadStatus(leadId, newStatus);
      if (res.success) {
        setStatusNotification(`Lead #${leadId} status changed to ${newStatus}`);
        setTimeout(() => setStatusNotification(""), 3500);
        onStatusUpdated(leadId, newStatus);
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.response?.data?.message || "Failed to update lead status");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "--";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "VERIFIED":
        return <span className="badge badge-verified">Verified</span>;
      case "PENDING":
        return <span className="badge badge-pending">Pending</span>;
      case "FAKE":
        return <span className="badge badge-fake">Fake</span>;
      case "DUPLICATE":
        return <span className="badge badge-duplicate">Duplicate</span>;
      case "RE_ATTEMPT":
        return <span className="badge badge-reattempt">Re-Attempt</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getQualityBadge = (quality, score) => {
    if (!quality) {
      return <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>--</span>;
    }
    const qUpper = quality.toUpperCase();
    if (qUpper === "HOT") {
      return <span className="quality-pill quality-hot">HOT ({score})</span>;
    }
    if (qUpper === "WARM") {
      return <span className="quality-pill quality-warm">WARM ({score})</span>;
    }
    return <span className="quality-pill quality-cold">COLD ({score})</span>;
  };

  return (
    <div className="table-card">
      {statusNotification && (
        <div className="alert alert-success" style={{ margin: "14px 18px 0" }}>
          <div>{statusNotification}</div>
        </div>
      )}

      {/* Toolbar */}
      <div className="table-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: "600" }}>Lead Management Queue</h2>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            ({leads.length} Leads)
          </span>
        </div>

        <div className="toolbar-filters">
          <input
            type="text"
            className="search-input"
            placeholder="Search name, phone, city..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          />

          <select
            className="form-select"
            style={{ width: "auto", padding: "6px 28px 6px 10px", fontSize: "0.8125rem" }}
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="FAKE">Fake</option>
            <option value="DUPLICATE">Duplicate</option>
            <option value="RE_ATTEMPT">Re-Attempt</option>
          </select>

          <select
            className="form-select"
            style={{ width: "auto", padding: "6px 28px 6px 10px", fontSize: "0.8125rem" }}
            value={filters.quality}
            onChange={(e) => onFilterChange({ ...filters, quality: e.target.value })}
          >
            <option value="ALL">All Qualities</option>
            <option value="HOT">Hot Leads</option>
            <option value="WARM">Warm Leads</option>
            <option value="COLD">Cold Leads</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="leads-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Route</th>
              <th>Service & Date</th>
              <th>Quality</th>
              <th>Status</th>
              <th>Matches</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td style={{ fontWeight: "600" }}>
                    #{lead.id}
                  </td>

                  <td>
                    <div className="customer-cell">
                      <span className="customer-name">{lead.customerName}</span>
                      <span className="customer-contact">+91 {lead.mobile} · {lead.email}</span>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontWeight: "500" }}>{lead.pickupCity} → {lead.destinationCity}</span>
                  </td>

                  <td>
                    <div style={{ fontWeight: "500" }}>{lead.serviceType}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {formatDate(lead.movingDate)}
                    </div>
                  </td>

                  <td>
                    {getQualityBadge(lead.leadQuality, lead.leadScore)}
                  </td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {getStatusBadge(lead.status)}
                      <select
                        className="status-select-inline"
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        title="Update status"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td>
                    {lead.companyMatches && lead.companyMatches.length > 0 ? (
                      <span className="tag-item" style={{ background: "var(--status-verified-bg)", color: "var(--status-verified-text)", fontWeight: "600" }}>
                        {lead.companyMatches.length} Movers
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>0</span>
                    )}
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <Link
                      to={`/admin/leads/${lead.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeadTable;

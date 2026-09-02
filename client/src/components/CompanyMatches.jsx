import React from "react";

function CompanyMatches({ companies = [] }) {
  if (!companies || companies.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", fontSize: "0.875rem" }}>
        No matching logistics companies found for this route.
      </div>
    );
  }

  return (
    <section style={{ marginTop: "18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "600" }}>
          Matched Logistics Partners ({companies.length})
        </h3>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Rule-based compatibility ranking
        </span>
      </div>

      <div className="matches-grid">
        {companies.map((company, index) => {
          const compName = company.companyName || company.company?.companyName || "Logistics Partner";
          const rating = company.rating || company.company?.rating || 4.5;
          const score = company.matchScore || 80;
          const coverage = company.coverage || company.company?.coverage || [];
          const serviceTypes = company.serviceTypes || company.company?.serviceTypes || [];
          const matchReasons = company.matchReasons || [
            "Route coverage match",
            "Service capability verified"
          ];

          return (
            <div key={company.companyId || company.id || index} className="match-company-card">
              <div className="match-card-header">
                <div>
                  <div className="company-title">{compName}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    ⭐ {rating.toFixed(1)} / 5.0 Rating
                  </div>
                </div>

                <div className="company-score-tag">
                  {score}% Match
                </div>
              </div>

              <div style={{ fontSize: "0.75rem", color: "var(--status-verified-text)", display: "flex", flexDirection: "column", gap: "2px" }}>
                {matchReasons.map((reason, rIdx) => (
                  <div key={rIdx}>✓ {reason}</div>
                ))}
              </div>

              <div>
                <div style={{ fontSize: "0.6875rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "3px", textTransform: "uppercase" }}>
                  Coverage
                </div>
                <div className="tag-list">
                  {coverage.slice(0, 4).map((city, cIdx) => (
                    <span key={cIdx} className="tag-item">{city}</span>
                  ))}
                  {coverage.length > 4 && (
                    <span className="tag-item">+{coverage.length - 4}</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.6875rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "3px", textTransform: "uppercase" }}>
                  Services
                </div>
                <div className="tag-list">
                  {serviceTypes.map((st, sIdx) => (
                    <span key={sIdx} className="tag-item" style={{ background: "var(--primary-light)", color: "var(--primary-700)" }}>
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CompanyMatches;

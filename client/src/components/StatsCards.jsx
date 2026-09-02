import React from "react";

function StatsCards({ stats = null, loading = false }) {
  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="stat-card" style={{ opacity: 0.5 }}>
            <div className="stat-label">Loading...</div>
            <div className="stat-value">--</div>
          </div>
        ))}
      </div>
    );
  }

  const summary = stats?.summary || {
    totalLeads: 0,
    verifiedLeads: 0,
    pendingLeads: 0,
    fakeLeads: 0,
    duplicateLeads: 0,
    reattemptLeads: 0
  };

  const quality = stats?.qualityDistribution || {
    hot: 0,
    warm: 0,
    cold: 0
  };

  const matching = stats?.matchingStats || {
    totalCompanies: 0,
    activeCompanies: 0,
    totalMatchesCreated: 0,
    leadsWithMatches: 0
  };

  const cards = [
    {
      label: "Total Leads",
      value: summary.totalLeads,
      footer: "All registered quotes"
    },
    {
      label: "Verified Leads",
      value: summary.verifiedLeads,
      footer: "OTP authenticated"
    },
    {
      label: "Pending OTP",
      value: summary.pendingLeads,
      footer: "Awaiting mobile verification"
    },
    {
      label: "Hot Leads (≥80)",
      value: quality.hot,
      footer: "High conversion intent"
    },
    {
      label: "Warm Leads (50-79)",
      value: quality.warm,
      footer: "Medium conversion"
    },
    {
      label: "Cold Leads (<50)",
      value: quality.cold,
      footer: "Standard / distant date"
    },
    {
      label: "Fake Leads",
      value: summary.fakeLeads,
      footer: "Flagged by admin"
    },
    {
      label: "Duplicate Leads",
      value: summary.duplicateLeads,
      footer: "Recent duplicate phone/route"
    },
    {
      label: "Matched Leads",
      value: `${matching.leadsWithMatches} / ${summary.totalLeads}`,
      footer: `${matching.totalMatchesCreated} company matches`
    }
  ];

  return (
    <section className="stats-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="stat-card">
          <div className="stat-header">
            <span className="stat-label">{card.label}</span>
          </div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-footer">{card.footer}</div>
        </div>
      ))}
    </section>
  );
}

export default StatsCards;

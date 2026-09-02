import React, { useState, useEffect, useCallback } from "react";
import StatsCards from "../components/StatsCards";
import LeadTable from "../components/LeadTable";
import { leadApi } from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [filters, setFilters] = useState({
    status: "ALL",
    quality: "ALL",
    search: ""
  });

  const loadDashboardData = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await leadApi.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const params = {};
      if (filters.status && filters.status !== "ALL") params.status = filters.status;
      if (filters.quality && filters.quality !== "ALL") params.quality = filters.quality;
      if (filters.search && filters.search.trim()) params.search = filters.search.trim();

      const res = await leadApi.getLeads(params);
      if (res.success && res.leads) {
        setLeads(res.leads);
      }
    } catch (err) {
      console.error("Failed to load leads queue:", err);
    } finally {
      setLoadingLeads(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleStatusUpdated = () => {
    // Reload both leads and aggregated statistics
    loadLeads();
    loadDashboardData();
  };

  const handleRefresh = () => {
    loadDashboardData();
    loadLeads();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", color: "var(--text-main)" }}>Admin Lead Management & Analytics</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Real-time lead scoring, status workflow management, and logistics partner matching analytics.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleRefresh}
          title="Refresh statistics and leads table"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* KPI Stats Grid */}
      <StatsCards stats={stats} loading={loadingStats} />

      {/* Leads Management Queue */}
      <LeadTable
        leads={leads}
        loading={loadingLeads}
        onStatusUpdated={handleStatusUpdated}
        onFilterChange={setFilters}
        filters={filters}
      />
    </div>
  );
}

export default AdminDashboard;

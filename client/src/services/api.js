import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const leadApi = {
  // Create customer moving lead
  createLead: async (leadData) => {
    const response = await apiClient.post("/leads", leadData);
    return response.data;
  },

  // Verify OTP for lead
  verifyOtp: async (leadId, otp) => {
    const response = await apiClient.post(`/leads/${leadId}/verify-otp`, { otp });
    return response.data;
  },

  // Resend fresh OTP
  resendOtp: async (leadId) => {
    const response = await apiClient.post(`/leads/${leadId}/resend-otp`);
    return response.data;
  },

  // List all leads with optional filters
  getLeads: async (params = {}) => {
    const response = await apiClient.get("/leads", { params });
    return response.data;
  },

  // Get lead details
  getLeadById: async (id) => {
    const response = await apiClient.get(`/leads/${id}`);
    return response.data;
  },

  // Update lead status
  updateLeadStatus: async (id, status) => {
    const response = await apiClient.patch(`/leads/${id}/status`, { status });
    return response.data;
  },

  // Get matching logistics companies
  getMatchingCompanies: async (id) => {
    const response = await apiClient.get(`/leads/${id}/matching-companies`);
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await apiClient.get("/dashboard");
    return response.data;
  },

  // Get logistics companies directory
  getCompanies: async () => {
    const response = await apiClient.get("/companies");
    return response.data;
  },

  // Get dynamic metadata (available cities, service types from database)
  getCompanyMetadata: async () => {
    const response = await apiClient.get("/companies/meta");
    return response.data;
  }
};

export default apiClient;

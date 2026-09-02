import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LeadRegistration from "./pages/LeadRegistration";
import VerifyOtp from "./pages/VerifyOtp";
import AdminDashboard from "./pages/AdminDashboard";
import LeadDetailsPage from "./pages/LeadDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<LeadRegistration />} />
            <Route path="/verify/:leadId" element={<VerifyOtp />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/leads/:id" element={<LeadDetailsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer style={{
          textAlign: "center",
          padding: "24px 20px",
          borderTop: "1px solid var(--border-light)",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
          background: "white"
        }}>
          <div>
            <strong>PackersMart Platform MVP</strong>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;

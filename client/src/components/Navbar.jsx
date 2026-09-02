import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">📦</div>
          <span>PackersMart</span>
        </Link>

        <div className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" || location.pathname.startsWith("/verify") ? "active" : ""}`}
          >
            Request Quote
          </Link>

          <Link
            to="/admin"
            className={`nav-link ${location.pathname.startsWith("/admin") ? "active" : ""}`}
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

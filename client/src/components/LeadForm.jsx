import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leadApi } from "../services/api";

const INITIAL_CITIES = [
  "Ahmedabad",
  "Bangalore",
  "Chandigarh",
  "Chennai",
  "Delhi",
  "Ghaziabad",
  "Gurgaon",
  "Hyderabad",
  "Jaipur",
  "Kanpur",
  "Lucknow",
  "Mumbai",
  "Nashik",
  "Noida",
  "Pune",
  "Surat"
];

const INITIAL_SERVICE_TYPES = [
  "Household",
  "Office",
  "Vehicle"
];

function LeadForm() {
  const navigate = useNavigate();

  const [availableCities, setAvailableCities] = useState(INITIAL_CITIES);
  const [availableServiceTypes, setAvailableServiceTypes] = useState(INITIAL_SERVICE_TYPES);

  const [formData, setFormData] = useState({
    customerName: "",
    mobile: "",
    email: "",
    pickupCity: "",
    destinationCity: "",
    serviceType: "",
    movingDate: "",
    additionalRequirements: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let isMounted = true;
    leadApi
      .getCompanyMetadata()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          if (res.data.cities?.length > 0) {
            setAvailableCities(res.data.cities);
          }
          if (res.data.serviceTypes?.length > 0) {
            setAvailableServiceTypes(res.data.serviceTypes);
          }
        }
      })
      .catch(() => {
        // Keeps initial fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "customerName":
        if (!value || !value.trim()) {
          error = "Full name is required.";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters.";
        } else if (/^\d+$/.test(value.trim())) {
          error = "Name cannot contain numbers only.";
        } else if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) {
          error = "Please enter letters only.";
        }
        break;

      case "mobile":
        const cleanMobile = value.trim();
        if (!cleanMobile) {
          error = "Mobile number is required.";
        } else if (/[a-zA-Z]/.test(cleanMobile)) {
          error = "Mobile number must be numeric digits only.";
        } else if (!/^\d{10}$/.test(cleanMobile)) {
          error = "Must be a 10-digit mobile number.";
        }
        break;

      case "email":
        const emailVal = value.trim();
        if (!emailVal) {
          error = "Email address is required.";
        } else if (!emailVal.includes("@")) {
          error = "Email must contain an '@' symbol.";
        } else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(emailVal)) {
          error = "Please enter a valid email format (e.g. name@domain.com).";
        }
        break;

      case "pickupCity":
        if (!value || value === "" || value.includes("Select")) {
          error = "Please select a pickup city.";
        }
        break;

      case "destinationCity":
        if (!value || value === "" || value.includes("Select")) {
          error = "Please select a destination city.";
        }
        break;

      case "serviceType":
        if (!value || value === "" || value.includes("Select")) {
          error = "Please select a service type.";
        }
        break;

      case "movingDate":
        if (!value) {
          error = "Please choose a moving date.";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const validateAll = () => {
    const newErrors = {};
    const allTouched = {};

    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    setTouched(allTouched);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await leadApi.createLead(formData);

      if (response.success && response.lead) {
        navigate(`/verify/${response.lead.id}`, {
          state: {
            lead: response.lead,
            initialOtp: response.otp,
            expiresAt: response.expiresAt,
            message: response.message
          }
        });
      } else {
        setServerError(response.message || "Failed to submit lead request.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setServerError(
        err.response?.data?.message || "Connection error. Please check the backend server."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="lead-form-wrapper">
      <div className="card">
        {serverError && (
          <div className="alert alert-error">
            <div>{serverError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {/* Customer Name */}
            <div className="form-group">
              <label htmlFor="customerName" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                className={`form-control ${touched.customerName && errors.customerName ? "error" : ""}`}
                placeholder="e.g. Rohit Sharma"
                value={formData.customerName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
              />
              {touched.customerName && errors.customerName && (
                <span className="field-error-msg">{errors.customerName}</span>
              )}
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label htmlFor="mobile" className="form-label">
                Mobile Number <span className="required">*</span>
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                maxLength={10}
                className={`form-control ${touched.mobile && errors.mobile ? "error" : ""}`}
                placeholder="10-digit number (e.g. 9876543210)"
                value={formData.mobile}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
              />
              {touched.mobile && errors.mobile && (
                <span className="field-error-msg">{errors.mobile}</span>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-control ${touched.email && errors.email ? "error" : ""}`}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
              />
              {touched.email && errors.email && (
                <span className="field-error-msg">{errors.email}</span>
              )}
            </div>

            {/* Service Type */}
            <div className="form-group">
              <label htmlFor="serviceType" className="form-label">
                Service Type <span className="required">*</span>
              </label>
              <select
                id="serviceType"
                name="serviceType"
                className={`form-select ${touched.serviceType && errors.serviceType ? "error" : ""}`}
                value={formData.serviceType}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
              >
                <option value="">Select Service Type</option>
                {availableServiceTypes.map((st) => (
                  <option key={st} value={st}>
                    {st} Shifting
                  </option>
                ))}
              </select>
              {touched.serviceType && errors.serviceType && (
                <span className="field-error-msg">{errors.serviceType}</span>
              )}
            </div>

            {/* Pickup City */}
            <div className="form-group">
              <label htmlFor="pickupCity" className="form-label">
                Pickup City <span className="required">*</span>
              </label>
              <select
                id="pickupCity"
                name="pickupCity"
                className={`form-select ${touched.pickupCity && errors.pickupCity ? "error" : ""}`}
                value={formData.pickupCity}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
              >
                <option value="">Select Pickup City</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {touched.pickupCity && errors.pickupCity && (
                <span className="field-error-msg">{errors.pickupCity}</span>
              )}
            </div>

            {/* Destination City */}
            <div className="form-group">
              <label htmlFor="destinationCity" className="form-label">
                Destination City <span className="required">*</span>
              </label>
              <select
                id="destinationCity"
                name="destinationCity"
                className={`form-select ${touched.destinationCity && errors.destinationCity ? "error" : ""}`}
                value={formData.destinationCity}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
              >
                <option value="">Select Destination City</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {touched.destinationCity && errors.destinationCity && (
                <span className="field-error-msg">{errors.destinationCity}</span>
              )}
            </div>

            {/* Moving Date */}
            <div className="form-group full-width">
              <label htmlFor="movingDate" className="form-label">
                Preferred Moving Date <span className="required">*</span>
              </label>
              <input
                id="movingDate"
                name="movingDate"
                type="date"
                min={minDate}
                className={`form-control ${touched.movingDate && errors.movingDate ? "error" : ""}`}
                value={formData.movingDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
              />
              {touched.movingDate && errors.movingDate && (
                <span className="field-error-msg">{errors.movingDate}</span>
              )}
            </div>

            {/* Additional Requirements */}
            <div className="form-group full-width">
              <label htmlFor="additionalRequirements" className="form-label">
                Additional Requirements / Scope (Optional)
              </label>
              <textarea
                id="additionalRequirements"
                name="additionalRequirements"
                rows={3}
                className="form-textarea"
                placeholder="Mention fragile items, elevator availability, special handling..."
                value={formData.additionalRequirements}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Lead..." : "Submit Quote Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeadForm;

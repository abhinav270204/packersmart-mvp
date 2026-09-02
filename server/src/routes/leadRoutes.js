const express = require("express");
const {
  createLead,
  verifyOtp,
  resendOtp,
  getLeads,
  getLeadById,
  updateLeadStatus,
  getMatchingCompanies
} = require("../controllers/leadController");

const router = express.Router();

router.post("/", createLead);
router.post("/:id/verify-otp", verifyOtp);
router.post("/:id/resend-otp", resendOtp);
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.patch("/:id/status", updateLeadStatus);
router.get("/:id/matching-companies", getMatchingCompanies);

module.exports = router;

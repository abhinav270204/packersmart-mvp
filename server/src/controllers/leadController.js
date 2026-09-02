const prisma = require("../utils/prisma");
const { createOtpForLead, verifyOtpForLead, getLatestOtpForLead } = require("../services/otpService");
const { calculateLeadScore } = require("../services/leadScoring");
const { findMatchingCompanies } = require("../services/companyMatching");

/**
 * 1. POST /api/leads
 * Register a new customer moving quote lead & generate OTP
 */
const createLead = async (req, res, next) => {
  try {
    console.log(`\n[Incoming Request] POST /api/leads - Customer: "${req.body.customerName}", Mobile: "${req.body.mobile}"`);

    const {
      customerName,
      mobile,
      email,
      pickupCity,
      destinationCity,
      serviceType,
      movingDate,
      additionalRequirements
    } = req.body;

    // Required field validation
    if (!customerName || !mobile || !email || !pickupCity || !destinationCity || !serviceType || !movingDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided (customerName, mobile, email, pickupCity, destinationCity, serviceType, movingDate)."
      });
    }

    const trimmedName = customerName.trim();
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Customer name must be at least 2 characters long."
      });
    }

    // Name must contain valid alphabetic characters (cannot be numbers only or random symbols)
    const nameRegex = /^[a-zA-Z\s.'-]+$/;
    if (!nameRegex.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        message: "Customer name can only contain letters, spaces, dots, or hyphens (cannot contain digits or special symbols)."
      });
    }

    // Mobile number validation: exactly 10 digits
    const cleanMobile = mobile.toString().trim();
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!/^\d{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 numeric digits."
      });
    }

    // Email validation: must have valid username, @, domain, and TLD
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address with an '@' and a domain (e.g. name@example.com)."
      });
    }

    // City validation: cannot be placeholder
    if (pickupCity.trim().toLowerCase().includes("select") || !pickupCity.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid pickup city."
      });
    }

    if (destinationCity.trim().toLowerCase().includes("select") || !destinationCity.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid destination city."
      });
    }

    // Service type validation
    if (serviceType.trim().toLowerCase().includes("select") || !serviceType.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid service type."
      });
    }

    const parsedMovingDate = new Date(movingDate);
    if (isNaN(parsedMovingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid moving date format."
      });
    }

    // Duplicate detection: Check if a lead with same mobile & route was created in past 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingRecentLead = await prisma.lead.findFirst({
      where: {
        mobile: cleanMobile,
        pickupCity: { equals: pickupCity.trim(), mode: "insensitive" },
        destinationCity: { equals: destinationCity.trim(), mode: "insensitive" },
        createdAt: { gte: oneDayAgo }
      }
    });

    const initialStatus = existingRecentLead ? "DUPLICATE" : "PENDING";

    // Create lead in database
    const lead = await prisma.lead.create({
      data: {
        customerName: customerName.trim(),
        mobile: cleanMobile,
        email: email.trim().toLowerCase(),
        pickupCity: pickupCity.trim(),
        destinationCity: destinationCity.trim(),
        serviceType: serviceType.trim(),
        movingDate: parsedMovingDate,
        additionalRequirements: additionalRequirements ? additionalRequirements.trim() : null,
        status: initialStatus,
        leadScore: 0,
        leadQuality: null
      }
    });

    // Generate 6-digit OTP (logged in backend terminal)
    const otpRecord = await createOtpForLead(lead.id, lead.customerName, lead.mobile);

    return res.status(201).json({
      success: true,
      message: initialStatus === "DUPLICATE"
        ? "Lead recorded (flagged as duplicate). Please check backend terminal for OTP."
        : "Lead registered successfully. Please verify the OTP sent to your mobile.",
      lead,
      otp: otpRecord.otp,
      expiresAt: otpRecord.expiresAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. POST /api/leads/:id/verify-otp
 * Verify 6-digit OTP, update lead to VERIFIED, calculate quality, match companies
 */
const verifyOtp = async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const { otp } = req.body;

    if (isNaN(leadId)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID." });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    // Verify OTP through service
    const otpResult = await verifyOtpForLead(leadId, otp);
    if (!otpResult.success) {
      return res.status(400).json(otpResult);
    }

    // Calculate score & quality classification for verified lead
    const scoringResult = calculateLeadScore({ ...lead, status: "VERIFIED" });

    // Update lead status and score
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "VERIFIED",
        leadScore: scoringResult.score,
        leadQuality: scoringResult.classification
      }
    });

    // Execute Logistics Company Matching algorithm
    const matchedCompanies = await findMatchingCompanies(updatedLead);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Lead quality scored and logistics partners matched.",
      lead: updatedLead,
      scoringBreakdown: scoringResult.breakdown,
      matchedCompanies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend OTP: POST /api/leads/:id/resend-otp
 */
const resendOtp = async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    if (isNaN(leadId)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID." });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    const newOtp = await createOtpForLead(lead.id, lead.customerName, lead.mobile);

    return res.status(200).json({
      success: true,
      message: "New 6-digit OTP generated and logged in backend terminal.",
      otp: newOtp.otp,
      expiresAt: newOtp.expiresAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. GET /api/leads
 * Fetch all leads with filtering, search, and pagination
 */
const getLeads = async (req, res, next) => {
  try {
    const { status, quality, search, sort = "desc" } = req.query;

    const where = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (quality && quality !== "ALL") {
      where.leadQuality = quality;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { customerName: { contains: q, mode: "insensitive" } },
        { mobile: { contains: q } },
        { email: { contains: q, mode: "insensitive" } },
        { pickupCity: { contains: q, mode: "insensitive" } },
        { destinationCity: { contains: q, mode: "insensitive" } }
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
      include: {
        otpVerifications: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        companyMatches: {
          include: {
            company: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. GET /api/leads/:id
 * Get single lead details with OTP history and matched companies
 */
const getLeadById = async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    if (isNaN(leadId)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID." });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        otpVerifications: {
          orderBy: { createdAt: "desc" }
        },
        companyMatches: {
          include: {
            company: true
          },
          orderBy: { matchScore: "desc" }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    const scoreDetails = calculateLeadScore(lead);

    return res.status(200).json({
      success: true,
      lead,
      scoringBreakdown: scoreDetails.breakdown
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. PATCH /api/leads/:id/status
 * Update lead status (PENDING, VERIFIED, FAKE, DUPLICATE, RE_ATTEMPT)
 */
const updateLeadStatus = async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(leadId)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID." });
    }

    const validStatuses = ["PENDING", "VERIFIED", "FAKE", "DUPLICATE", "RE_ATTEMPT"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!existingLead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    // If changing to VERIFIED, recalculate score & find matches if none exist
    let updatedData = { status };
    if (status === "VERIFIED") {
      const scoringResult = calculateLeadScore({ ...existingLead, status: "VERIFIED" });
      updatedData.leadScore = scoringResult.score;
      updatedData.leadQuality = scoringResult.classification;
      await findMatchingCompanies(existingLead);
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: updatedData,
      include: {
        companyMatches: {
          include: { company: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: `Lead status updated to ${status}.`,
      lead: updatedLead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. GET /api/leads/:id/matching-companies
 * Find or retrieve matching companies for a lead
 */
const getMatchingCompanies = async (req, res, next) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    if (isNaN(leadId)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID." });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    const matches = await findMatchingCompanies(lead);

    return res.status(200).json({
      success: true,
      leadId: lead.id,
      count: matches.length,
      matches
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  verifyOtp,
  resendOtp,
  getLeads,
  getLeadById,
  updateLeadStatus,
  getMatchingCompanies
};

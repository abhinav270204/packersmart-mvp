const prisma = require("../utils/prisma");
const generateOtp = require("../utils/generateOtp");

/**
 * Creates and stores a 6-digit OTP for a lead with a 10-minute expiry.
 * Logs the OTP clearly to backend console for developer/tester inspection.
 * @param {number} leadId
 * @param {string} [customerName]
 * @param {string} [mobile]
 * @returns {Promise<object>} The created OTP verification record
 */
async function createOtpForLead(leadId, customerName = "", mobile = "") {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  const otpRecord = await prisma.otpVerification.create({
    data: {
      leadId: Number(leadId),
      otp,
      expiresAt
    }
  });

  // Professional formatted terminal logging
  console.log("\n=======================================================");
  console.log("🔐 [PACKERSMART BACKEND OTP DISPATCH LOG]");
  console.log(`   Lead ID     : #${leadId} ${customerName ? `(${customerName})` : ""}`);
  if (mobile) console.log(`   Mobile No.  : +91 ${mobile}`);
  console.log(`   6-Digit OTP : >>> ${otp} <<<`);
  console.log(`   Generated At: ${new Date().toLocaleTimeString()}`);
  console.log(`   Expires At  : ${expiresAt.toLocaleTimeString()} (10 mins)`);
  console.log("=======================================================\n");

  return otpRecord;
}

/**
 * Validates the provided OTP against the latest OTP record for a lead.
 * @param {number} leadId
 * @param {string} otpInput
 * @returns {Promise<{success: boolean, reason?: string, message: string, otpRecord?: object}>}
 */
async function verifyOtpForLead(leadId, otpInput) {
  if (!otpInput || otpInput.trim().length !== 6) {
    return {
      success: false,
      reason: "INVALID_FORMAT",
      message: "Please enter a valid 6-digit OTP."
    };
  }

  const latestOtpRecord = await prisma.otpVerification.findFirst({
    where: { leadId: Number(leadId) },
    orderBy: { createdAt: "desc" }
  });

  if (!latestOtpRecord) {
    return {
      success: false,
      reason: "OTP_NOT_FOUND",
      message: "No OTP record found for this lead. Please request a new code."
    };
  }

  if (latestOtpRecord.verifiedAt) {
    return {
      success: false,
      reason: "ALREADY_VERIFIED",
      message: "This OTP has already been verified."
    };
  }

  const now = new Date();
  if (now > new Date(latestOtpRecord.expiresAt)) {
    console.log(`[OTP Verification Failed] Lead #${leadId}: OTP ${latestOtpRecord.otp} expired at ${latestOtpRecord.expiresAt}`);
    return {
      success: false,
      reason: "EXPIRED_OTP",
      message: "This OTP has expired. Please request a new OTP code."
    };
  }

  if (latestOtpRecord.otp.trim() !== otpInput.trim()) {
    console.log(`[OTP Verification Failed] Lead #${leadId}: Input "${otpInput}" did not match expected "${latestOtpRecord.otp}"`);
    return {
      success: false,
      reason: "INVALID_OTP",
      message: "Incorrect OTP entered. Please check backend log and try again."
    };
  }

  // Mark OTP as verified
  const updatedRecord = await prisma.otpVerification.update({
    where: { id: latestOtpRecord.id },
    data: { verifiedAt: now }
  });

  console.log(`\n✅ [OTP Verified] Lead #${leadId} verified successfully at ${now.toLocaleTimeString()}\n`);

  return {
    success: true,
    message: "OTP successfully verified.",
    otpRecord: updatedRecord
  };
}

/**
 * Retrieves the latest OTP record
 */
async function getLatestOtpForLead(leadId) {
  return await prisma.otpVerification.findFirst({
    where: { leadId: Number(leadId) },
    orderBy: { createdAt: "desc" }
  });
}

module.exports = {
  generateOtp,
  createOtpForLead,
  verifyOtpForLead,
  getLatestOtpForLead
};

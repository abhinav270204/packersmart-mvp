/**
 * Calculates lead quality score (0-100) and classification (HOT, WARM, COLD).
 *
 * Scoring Breakdown (Total: 100 points):
 * 1. OTP Verification: +20 pts
 * 2. Moving Timeline / Urgency: Up to +25 pts
 *    - Moving within 7 days: +25 pts
 *    - Moving within 8-30 days: +20 pts
 *    - Moving within 31-60 days: +15 pts
 *    - Moving 60+ days: +10 pts
 * 3. Contact Completeness: +20 pts
 *    - Valid 10-digit phone: +10 pts
 *    - Valid email format: +10 pts
 * 4. Route Scope: Up to +15 pts
 *    - Inter-city move (Pickup != Destination): +15 pts
 *    - Intra-city / Local move: +10 pts
 * 5. Requirements Details: Up to +10 pts
 *    - Detailed requirements (> 10 chars): +10 pts
 *    - Short note (< 10 chars): +5 pts
 * 6. High-Value Service Type: +10 pts
 *    - Household, Office, or Vehicle moving: +10 pts
 */

function calculateLeadScore(lead) {
  let score = 0;
  const breakdown = {
    otpVerified: 0,
    movingUrgency: 0,
    contactValidity: 0,
    routeScope: 0,
    requirementsDetail: 0,
    serviceType: 0
  };

  // 1. Verification status
  if (lead.status === "VERIFIED" || lead.isVerified) {
    breakdown.otpVerified = 20;
    score += 20;
  }

  // 2. Moving Date Urgency
  if (lead.movingDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const moveDate = new Date(lead.movingDate);
    const diffDays = Math.ceil((moveDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 7) {
      breakdown.movingUrgency = 25;
      score += 25;
    } else if (diffDays > 7 && diffDays <= 30) {
      breakdown.movingUrgency = 20;
      score += 20;
    } else if (diffDays > 30 && diffDays <= 60) {
      breakdown.movingUrgency = 15;
      score += 15;
    } else {
      breakdown.movingUrgency = 10;
      score += 10;
    }
  }

  // 3. Contact Validity
  const phoneClean = (lead.mobile || "").replace(/\D/g, "");
  if (phoneClean.length === 10) {
    breakdown.contactValidity += 10;
    score += 10;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (lead.email && emailRegex.test(lead.email)) {
    breakdown.contactValidity += 10;
    score += 10;
  }

  // 4. Route Scope
  if (lead.pickupCity && lead.destinationCity) {
    const isInterCity = lead.pickupCity.trim().toLowerCase() !== lead.destinationCity.trim().toLowerCase();
    const routeScore = isInterCity ? 15 : 10;
    breakdown.routeScope = routeScore;
    score += routeScore;
  }

  // 5. Requirements Details
  if (lead.additionalRequirements && lead.additionalRequirements.trim().length >= 10) {
    breakdown.requirementsDetail = 10;
    score += 10;
  } else if (lead.additionalRequirements && lead.additionalRequirements.trim().length > 0) {
    breakdown.requirementsDetail = 5;
    score += 5;
  }

  // 6. Service Type
  if (lead.serviceType && ["Household", "Office", "Vehicle", "Commercial"].includes(lead.serviceType)) {
    breakdown.serviceType = 10;
    score += 10;
  } else if (lead.serviceType) {
    breakdown.serviceType = 8;
    score += 8;
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  return {
    score: finalScore,
    classification: classifyLead(finalScore),
    breakdown
  };
}

/**
 * Classifies lead based on numeric score
 * @param {number} score
 * @returns {"HOT" | "WARM" | "COLD"}
 */
function classifyLead(score) {
  if (score >= 80) return "HOT";
  if (score >= 50) return "WARM";
  return "COLD";
}

module.exports = {
  calculateLeadScore,
  classifyLead
};

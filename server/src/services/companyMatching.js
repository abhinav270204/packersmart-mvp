const prisma = require("../utils/prisma");

/**
 * Evaluates active companies against lead requirements and records matches.
 *
 * Matching Criteria (Max Score: 100):
 * - Pickup city in company coverage: +40 pts
 * - Destination city in company coverage: +40 pts
 * - Service type in company serviceTypes: +20 pts
 *
 * Threshold: Companies with match score >= 60 are matched and stored in LeadCompanyMatch.
 *
 * @param {object} lead
 * @returns {Promise<Array>} Array of matched companies with scores and match reasons
 */
async function findMatchingCompanies(lead) {
  const activeCompanies = await prisma.company.findMany({
    where: { status: "ACTIVE" }
  });

  const leadPickup = (lead.pickupCity || "").trim().toLowerCase();
  const leadDestination = (lead.destinationCity || "").trim().toLowerCase();
  const leadService = (lead.serviceType || "").trim().toLowerCase();

  const scoredMatches = [];

  for (const company of activeCompanies) {
    let score = 0;
    const matchReasons = [];

    // Check pickup city coverage (case-insensitive)
    const coversPickup = company.coverage.some(
      (c) => c.trim().toLowerCase() === leadPickup
    );
    if (coversPickup) {
      score += 40;
      matchReasons.push(`Pickup city (${lead.pickupCity}) in service area`);
    }

    // Check destination city coverage (case-insensitive)
    const coversDestination = company.coverage.some(
      (c) => c.trim().toLowerCase() === leadDestination
    );
    if (coversDestination) {
      score += 40;
      matchReasons.push(`Destination city (${lead.destinationCity}) in service area`);
    }

    // Check service type compatibility (case-insensitive)
    const offersService = company.serviceTypes.some(
      (s) => s.trim().toLowerCase() === leadService || leadService.includes(s.trim().toLowerCase())
    );
    if (offersService) {
      score += 20;
      matchReasons.push(`Offers ${lead.serviceType} moving services`);
    }

    // Only qualify if score is >= 60 (e.g. at least pickup or destination + service, or both routes)
    if (score >= 60) {
      scoredMatches.push({
        companyId: company.id,
        companyName: company.companyName,
        rating: company.rating,
        coverage: company.coverage,
        serviceTypes: company.serviceTypes,
        matchScore: score,
        matchReasons
      });
    }
  }

  // Sort by matchScore descending, then rating descending
  scoredMatches.sort((a, b) => b.matchScore - a.matchScore || b.rating - a.rating);

  // Upsert matches in database if lead ID is valid
  if (lead.id && scoredMatches.length > 0) {
    for (const match of scoredMatches) {
      await prisma.leadCompanyMatch.upsert({
        where: {
          leadId_companyId: {
            leadId: lead.id,
            companyId: match.companyId
          }
        },
        update: {
          matchScore: match.matchScore,
          notificationStatus: "MATCHED"
        },
        create: {
          leadId: lead.id,
          companyId: match.companyId,
          matchScore: match.matchScore,
          notificationStatus: "MATCHED"
        }
      });
    }
  }

  return scoredMatches;
}

module.exports = {
  findMatchingCompanies
};

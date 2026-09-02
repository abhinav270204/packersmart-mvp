const prisma = require("../utils/prisma");

/**
 * GET /api/dashboard
 * Aggregates all dashboard metrics dynamically from PostgreSQL database
 */
const getDashboard = async (req, res, next) => {
  try {
    // 1. Lead counts by status
    const [
      totalLeads,
      pendingLeads,
      verifiedLeads,
      fakeLeads,
      duplicateLeads,
      reattemptLeads
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "PENDING" } }),
      prisma.lead.count({ where: { status: "VERIFIED" } }),
      prisma.lead.count({ where: { status: "FAKE" } }),
      prisma.lead.count({ where: { status: "DUPLICATE" } }),
      prisma.lead.count({ where: { status: "RE_ATTEMPT" } })
    ]);

    // 2. Lead quality breakdown
    const [hotLeads, warmLeads, coldLeads] = await Promise.all([
      prisma.lead.count({ where: { leadQuality: "HOT" } }),
      prisma.lead.count({ where: { leadQuality: "WARM" } }),
      prisma.lead.count({ where: { leadQuality: "COLD" } })
    ]);

    // 3. Company and matching statistics
    const [
      totalCompanies,
      activeCompanies,
      totalMatchesCreated,
      leadsWithMatchesCount
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { status: "ACTIVE" } }),
      prisma.leadCompanyMatch.count(),
      prisma.leadCompanyMatch.groupBy({
        by: ["leadId"],
        _count: { companyId: true }
      })
    ]);

    // 4. Recent leads for quick dashboard preview
    const recentLeads = await prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        companyMatches: {
          include: { company: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalLeads,
          verifiedLeads,
          pendingLeads,
          fakeLeads,
          duplicateLeads,
          reattemptLeads
        },
        qualityDistribution: {
          hot: hotLeads,
          warm: warmLeads,
          cold: coldLeads
        },
        matchingStats: {
          totalCompanies,
          activeCompanies,
          totalMatchesCreated,
          leadsWithMatches: leadsWithMatchesCount.length
        },
        recentLeads
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };

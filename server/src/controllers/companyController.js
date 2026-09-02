const prisma = require("../utils/prisma");

/**
 * GET /api/companies
 * Retrieve all registered logistics companies
 */
const getCompanies = async (req, res, next) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { rating: "desc" }
    });

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/companies/meta
 * Dynamically extract distinct available coverage cities and service types from PostgreSQL
 */
const getCompanyMetadata = async (req, res, next) => {
  try {
    const companies = await prisma.company.findMany({
      where: { status: "ACTIVE" },
      select: { coverage: true, serviceTypes: true }
    });

    const citySet = new Set();
    const serviceTypeSet = new Set();

    companies.forEach((comp) => {
      if (Array.isArray(comp.coverage)) {
        comp.coverage.forEach((city) => citySet.add(city.trim()));
      }
      if (Array.isArray(comp.serviceTypes)) {
        comp.serviceTypes.forEach((st) => serviceTypeSet.add(st.trim()));
      }
    });

    const cities = Array.from(citySet).sort();
    const serviceTypes = Array.from(serviceTypeSet).sort();

    return res.status(200).json({
      success: true,
      data: {
        cities,
        serviceTypes
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyMetadata
};

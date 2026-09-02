const express = require("express");
const { getCompanies, getCompanyMetadata } = require("../controllers/companyController");

const router = express.Router();

router.get("/", getCompanies);
router.get("/meta", getCompanyMetadata);

module.exports = router;

const prisma = require("../src/utils/prisma");

const companies = [
  {
    companyName: "Delhi Movers",
    coverage: ["Delhi", "Noida", "Gurgaon", "Ghaziabad", "Mumbai"],
    serviceTypes: ["Household", "Office"],
    rating: 4.5,
    status: "ACTIVE"
  },
  {
    companyName: "NorthStar Packers",
    coverage: ["Delhi", "Chandigarh", "Jaipur", "Noida"],
    serviceTypes: ["Household", "Vehicle"],
    rating: 4.3,
    status: "ACTIVE"
  },
  {
    companyName: "QuickShift Logistics",
    coverage: ["Delhi", "Mumbai", "Pune", "Bangalore"],
    serviceTypes: ["Household", "Office", "Vehicle"],
    rating: 4.2,
    status: "ACTIVE"
  },
  {
    companyName: "SafeMove Packers",
    coverage: ["Mumbai", "Pune", "Nashik", "Delhi"],
    serviceTypes: ["Household", "Office"],
    rating: 4.6,
    status: "ACTIVE"
  },
  {
    companyName: "Urban Relocation",
    coverage: ["Bangalore", "Hyderabad", "Chennai", "Pune"],
    serviceTypes: ["Household", "Office"],
    rating: 4.1,
    status: "ACTIVE"
  },
  {
    companyName: "Express Movers",
    coverage: ["Delhi", "Noida", "Lucknow", "Kanpur"],
    serviceTypes: ["Household"],
    rating: 4.0,
    status: "ACTIVE"
  },
  {
    companyName: "Reliable Shifting",
    coverage: ["Mumbai", "Ahmedabad", "Surat", "Pune"],
    serviceTypes: ["Household", "Vehicle"],
    rating: 4.4,
    status: "ACTIVE"
  },
  {
    companyName: "PrimeMove Logistics",
    coverage: ["Delhi", "Mumbai", "Bangalore", "Hyderabad"],
    serviceTypes: ["Office", "Household"],
    rating: 4.7,
    status: "ACTIVE"
  }
];

async function main() {
  // TODO: Seed companies after confirming the database connection.
  await prisma.company.deleteMany();
  await prisma.company.createMany({ data: companies });
  console.log("Seeded companies:", companies.length);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

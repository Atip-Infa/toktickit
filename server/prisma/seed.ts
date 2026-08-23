import { getPrisma } from "../src/prisma.js";

async function main() {
  const prisma = getPrisma();

  // 1. Seed Categories (4 required)
  const categories = [
    { name: "Account and Access", code: "ACC_ACCESS" },
    { name: "Hardware", code: "HARDWARE" },
    { name: "Software", code: "SOFTWARE" },
    { name: "Network", code: "NETWORK" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { code: cat.code, isActive: true },
      create: { name: cat.name, code: cat.code, isActive: true },
    });
  }

  // 2. Seed Related Systems (at least 6, we seed 7)
  const relatedSystems = [
    { name: "Email", code: "EMAIL" },
    { name: "Campus Wi-Fi", code: "WIFI" },
    { name: "VPN", code: "VPN" },
    { name: "LEB2 App", code: "LEB2" },
    { name: "Grade Submission App", code: "GRADES" },
    { name: "Printer", code: "PRINTER" },
    { name: "Corporate Laptop", code: "LAPTOP" },
  ];

  for (const sys of relatedSystems) {
    await prisma.relatedSystem.upsert({
      where: { name: sys.name },
      update: { code: sys.code, isActive: true },
      create: { name: sys.name, code: sys.code, isActive: true },
    });
  }

  // 3. Seed Development Requesters (4 active, 1 inactive)
  const requesters = [
    {
      name: "Jennifer Anderson",
      email: "jennifer.a@kmutt.ac.th",
      department: "Computer Engineering",
      isActive: true,
    },
    {
      name: "David Lee",
      email: "david.l@kmutt.ac.th",
      department: "Information Technology",
      isActive: true,
    },
    {
      name: "Sarah Johnson",
      email: "sarah.j@kmutt.ac.th",
      department: "Electrical Engineering",
      isActive: true,
    },
    {
      name: "Michael Scott",
      email: "michael.s@kmutt.ac.th",
      department: "Administration",
      isActive: true,
    },
    {
      name: "Robert Paulson",
      email: "robert.p@kmutt.ac.th",
      department: "Facilities",
      isActive: false,
    },
  ];

  for (const req of requesters) {
    await prisma.developmentRequester.upsert({
      where: { email: req.email },
      update: {
        name: req.name,
        department: req.department,
        isActive: req.isActive,
      },
      create: {
        name: req.name,
        email: req.email,
        department: req.department,
        isActive: req.isActive,
      },
    });
  }

  console.log("Successfully seeded Lab 2 Categories, Related Systems, and Development Requesters.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });

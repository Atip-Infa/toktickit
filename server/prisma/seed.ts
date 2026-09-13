import { getPrisma } from "../src/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const prisma = getPrisma();

  // Standard hashed password for seeded users
  const defaultPasswordHash = bcrypt.hashSync("Password123!", 10);

  // 1. Seed Categories (4 required)
  const categories = [
    { name: "Account and Access", code: "ACC_ACCESS" },
    { name: "Hardware", code: "HARDWARE" },
    { name: "Software", code: "SOFTWARE" },
    { name: "Network", code: "NETWORK" },
  ];

  const createdCategories: Record<string, number> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { name: cat.name },
      update: { code: cat.code, isActive: true },
      create: { name: cat.name, code: cat.code, isActive: true },
    });
    createdCategories[cat.name] = c.id;
  }

  // 2. Seed Related Systems (at least 6)
  const relatedSystems = [
    { name: "Email", code: "EMAIL" },
    { name: "Campus Wi-Fi", code: "WIFI" },
    { name: "VPN", code: "VPN" },
    { name: "LEB2 App", code: "LEB2" },
    { name: "Grade Submission App", code: "GRADES" },
    { name: "Printer", code: "PRINTER" },
    { name: "Corporate Laptop", code: "LAPTOP" },
  ];

  const createdSystems: Record<string, number> = {};
  for (const sys of relatedSystems) {
    const s = await prisma.relatedSystem.upsert({
      where: { name: sys.name },
      update: { code: sys.code, isActive: true },
      create: { name: sys.name, code: sys.code, isActive: true },
    });
    createdSystems[sys.name] = s.id;
  }

  // 3. Seed Users (Requesters, IT Staff, Administrator)
  const usersData = [
    // Requesters (4 active, 1 inactive)
    {
      name: "Jennifer Anderson",
      email: "jennifer@toktickit.com",
      role: "REQUESTER" as const,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "David Lee",
      email: "david@toktickit.com",
      role: "REQUESTER" as const,
      isActive: true,
      mustChangePassword: true,
    },
    {
      name: "Sarah Johnson",
      email: "sarah@toktickit.com",
      role: "REQUESTER" as const,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "Emily Davis",
      email: "emily@toktickit.com",
      role: "REQUESTER" as const,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "Robert Wilson",
      email: "robert@toktickit.com",
      role: "REQUESTER" as const,
      isActive: false,
      mustChangePassword: false,
    },
    // IT Staff (3 active, 1 inactive)
    {
      name: "Michael Brown",
      email: "michael@toktickit.com",
      role: "IT_STAFF" as const,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "Lisa Martinez",
      email: "lisa@toktickit.com",
      role: "IT_STAFF" as const,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "Amanda Clark",
      email: "amanda@toktickit.com",
      role: "IT_STAFF" as const,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "Kevin Patel",
      email: "kevin@toktickit.com",
      role: "IT_STAFF" as const,
      isActive: false,
      mustChangePassword: false,
    },
    // Administrator (1 active)
    {
      name: "John Smith",
      email: "admin@toktickit.com",
      role: "ADMINISTRATOR" as const,
      isActive: true,
      mustChangePassword: false,
    },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of usersData) {
    const userObj = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        mustChangePassword: u.mustChangePassword,
        passwordHash: defaultPasswordHash,
      },
      create: {
        name: u.name,
        email: u.email,
        passwordHash: defaultPasswordHash,
        role: u.role,
        isActive: u.isActive,
        mustChangePassword: u.mustChangePassword,
      },
    });
    createdUsers[u.email] = userObj;
  }

  // 4. Seed Development Requesters (for Lab 2 backward compatibility)
  const devRequesters = [
    { name: "Jennifer Anderson", email: "jennifer.a@kmutt.ac.th", department: "Computer Engineering", isActive: true },
    { name: "David Lee", email: "david.l@kmutt.ac.th", department: "Information Technology", isActive: true },
    { name: "Sarah Johnson", email: "sarah.j@kmutt.ac.th", department: "Electrical Engineering", isActive: true },
    { name: "Michael Scott", email: "michael.s@kmutt.ac.th", department: "Administration", isActive: true },
    { name: "Robert Paulson", email: "robert.p@kmutt.ac.th", department: "Facilities", isActive: false },
  ];

  for (const req of devRequesters) {
    await prisma.developmentRequester.upsert({
      where: { email: req.email },
      update: { name: req.name, department: req.department, isActive: req.isActive },
      create: { name: req.name, email: req.email, department: req.department, isActive: req.isActive },
    });
  }

  // 5. Seed Realistic Tickets
  const sampleTickets = [
    {
      ticketNumber: "TXT-2025-001234",
      requesterEmail: "jennifer@toktickit.com",
      categoryName: "Hardware",
      systemName: "Corporate Laptop",
      requestedPriority: "MEDIUM" as const,
      itPriority: "MEDIUM" as const,
      status: "IN_PROGRESS" as const,
      ownerEmail: "michael@toktickit.com",
      summary: "Laptop battery drains quickly",
      description: "My laptop battery is draining much faster than usual even when idle. This started after last week's Windows update.",
    },
    {
      ticketNumber: "TXT-2025-001233",
      requesterEmail: "david@toktickit.com",
      categoryName: "Network",
      systemName: "VPN",
      requestedPriority: "HIGH" as const,
      itPriority: "HIGH" as const,
      status: "OPEN" as const,
      ownerEmail: "lisa@toktickit.com",
      summary: "Cannot connect to VPN",
      description: "VPN client fails to authenticate when trying to connect from off-campus network.",
    },
    {
      ticketNumber: "TXT-2025-001232",
      requesterEmail: "sarah@toktickit.com",
      categoryName: "Software",
      systemName: "LEB2 App",
      requestedPriority: "MEDIUM" as const,
      itPriority: "MEDIUM" as const,
      status: "IN_PROGRESS" as const,
      ownerEmail: "michael@toktickit.com",
      summary: "Email not syncing on mobile",
      description: "Corporate email app stopped syncing on my phone after updating to iOS 18.",
    },
    {
      ticketNumber: "TXT-2025-001231",
      requesterEmail: "jennifer@toktickit.com",
      categoryName: "Account and Access",
      systemName: "Grade Submission App",
      requestedPriority: "LOW" as const,
      itPriority: "LOW" as const,
      status: "RESOLVED" as const,
      ownerEmail: "lisa@toktickit.com",
      summary: "New employee setup request",
      description: "Please provision account access for our new departmental TA.",
      resolutionSummary: "Access granted and welcome email dispatched with temporary credentials.",
    },
    {
      ticketNumber: "TXT-2025-001230",
      requesterEmail: "emily@toktickit.com",
      categoryName: "Hardware",
      systemName: "Printer",
      requestedPriority: "MEDIUM" as const,
      itPriority: "LOW" as const,
      status: "OPEN" as const,
      ownerEmail: null,
      summary: "Printer keeps showing offline",
      description: "Shared printer on 3rd floor intermittently drops off the local network.",
    },
    {
      ticketNumber: "TXT-2025-001229",
      requesterEmail: "sarah@toktickit.com",
      categoryName: "Account and Access",
      systemName: "Email",
      requestedPriority: "LOW" as const,
      itPriority: "LOW" as const,
      status: "WAITING_FOR_REQUESTER" as const,
      ownerEmail: "amanda@toktickit.com",
      summary: "Request access to SharePoint repository",
      description: "Need read access to team project documentation folder.",
    },
  ];

  for (const t of sampleTickets) {
    const requester = createdUsers[t.requesterEmail];
    const owner = t.ownerEmail ? createdUsers[t.ownerEmail] : null;
    const catId = createdCategories[t.categoryName];
    const sysId = createdSystems[t.systemName];

    if (!requester || !catId || !sysId) continue;

    const ticketObj = await prisma.ticket.upsert({
      where: { ticketNumber: t.ticketNumber },
      update: {
        requesterId: requester.id,
        categoryId: catId,
        relatedSystemId: sysId,
        ownerId: owner ? owner.id : null,
        requestedPriority: t.requestedPriority,
        itPriority: t.itPriority,
        status: t.status,
        summary: t.summary,
        description: t.description,
        resolutionSummary: t.resolutionSummary || null,
      },
      create: {
        ticketNumber: t.ticketNumber,
        requesterId: requester.id,
        categoryId: catId,
        relatedSystemId: sysId,
        ownerId: owner ? owner.id : null,
        requestedPriority: t.requestedPriority,
        itPriority: t.itPriority,
        status: t.status,
        summary: t.summary,
        description: t.description,
        resolutionSummary: t.resolutionSummary || null,
      },
    });

    // 6. Seed Public Comments & Internal Notes for TXT-2025-001234
    if (t.ticketNumber === "TXT-2025-001234") {
      const michael = createdUsers["michael@toktickit.com"];
      const jennifer = createdUsers["jennifer@toktickit.com"];

      if (michael && jennifer) {
        // Public Comments
        const existingPublicCount = await prisma.publicComment.count({ where: { ticketId: ticketObj.id } });
        if (existingPublicCount === 0) {
          await prisma.publicComment.createMany({
            data: [
              {
                ticketId: ticketObj.id,
                authorId: jennifer.id,
                content: "Just adding that this issue occurs even when I close all applications.",
                createdAt: new Date("2025-05-12T09:20:00Z"),
              },
              {
                ticketId: ticketObj.id,
                authorId: michael.id,
                content: "We are investigating the issue on your device. We'll update you shortly.",
                createdAt: new Date("2025-05-13T10:30:00Z"),
              },
              {
                ticketId: ticketObj.id,
                authorId: jennifer.id,
                content: "Thank you for the update. Please let me know if you need any additional information.",
                createdAt: new Date("2025-05-13T11:45:00Z"),
              },
            ],
          });
        }

        // Internal Notes
        const existingInternalCount = await prisma.internalNote.count({ where: { ticketId: ticketObj.id } });
        if (existingInternalCount === 0) {
          await prisma.internalNote.createMany({
            data: [
              {
                ticketId: ticketObj.id,
                authorId: michael.id,
                content: "Ran battery diagnostics. Cycle count is 650+. Replacement battery requested from vendor.",
                createdAt: new Date("2025-05-13T10:35:00Z"),
              },
              {
                ticketId: ticketObj.id,
                authorId: michael.id,
                content: "Battery replacement unit arrived. Scheduled hardware install for tomorrow morning.",
                createdAt: new Date("2025-05-14T08:15:00Z"),
              },
            ],
          });
        }
      }
    }
  }

  console.log("Successfully seeded Lab 3 Database Increment:");
  console.log("- 4 Active Requesters, 1 Inactive Requester");
  console.log("- 3 Active IT Staff, 1 Inactive IT Staff");
  console.log("- 1 Active Administrator");
  console.log("- Realistic Tickets across statuses, priorities, assigned/unassigned");
  console.log("- Public Comments and Internal Notes seeded cleanly.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });

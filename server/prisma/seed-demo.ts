import { auth } from "../src/config/auth.js";
import { prisma } from "../src/config/prisma.js";
import { env } from "../src/config/env.js";
import type { BloodGroup, Urgency, RequestStatus, DonationStatus } from "@prisma/client";

// Ensure script connects strictly to the host defined in DATABASE_URL
const dbHost = new URL(env.DATABASE_URL).host;
console.log(`[Seed Demo] Target Database Host: ${dbHost}`);

interface DemoDonorDef {
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  district: string;
  area: string;
  isAvailable: boolean;
  daysAgoDonated: number | null; // null = never donated
}

// 20 Demo donors covering all 8 blood groups and 10 districts
const DEMO_DONORS: DemoDonorDef[] = [
  // 1-12: Eligible and available donors across all blood groups
  {
    name: "Sakib Al Hasan",
    email: "demo.donor1@bloodsync.test",
    phone: "+8801710000001",
    bloodGroup: "O_POSITIVE",
    district: "Dhaka",
    area: "Dhanmondi",
    isAvailable: true,
    daysAgoDonated: null,
  },
  {
    name: "Tamim Iqbal",
    email: "demo.donor2@bloodsync.test",
    phone: "+8801710000002",
    bloodGroup: "A_POSITIVE",
    district: "Chittagong",
    area: "Agrabad",
    isAvailable: true,
    daysAgoDonated: null,
  },
  {
    name: "Mushfiqur Rahim",
    email: "demo.donor3@bloodsync.test",
    phone: "+8801710000003",
    bloodGroup: "B_POSITIVE",
    district: "Rajshahi",
    area: "Motihar",
    isAvailable: true,
    daysAgoDonated: null,
  },
  {
    name: "Mahmudullah Riyad",
    email: "demo.donor4@bloodsync.test",
    phone: "+8801710000004",
    bloodGroup: "AB_POSITIVE",
    district: "Mymensingh",
    area: "Town Hall",
    isAvailable: true,
    daysAgoDonated: null,
  },
  {
    name: "Mustafizur Rahman",
    email: "demo.donor5@bloodsync.test",
    phone: "+8801710000005",
    bloodGroup: "O_NEGATIVE",
    district: "Khulna",
    area: "Khalishpur",
    isAvailable: true,
    daysAgoDonated: null,
  },
  {
    name: "Mashrafe Mortaza",
    email: "demo.donor6@bloodsync.test",
    phone: "+8801710000006",
    bloodGroup: "A_NEGATIVE",
    district: "Barisal",
    area: "Sadar",
    isAvailable: true,
    daysAgoDonated: null,
  },
  {
    name: "Taskin Ahmed",
    email: "demo.donor7@bloodsync.test",
    phone: "+8801710000007",
    bloodGroup: "B_NEGATIVE",
    district: "Dhaka",
    area: "Gulshan",
    isAvailable: true,
    daysAgoDonated: null,
  },
  {
    name: "Litton Das",
    email: "demo.donor8@bloodsync.test",
    phone: "+8801710000008",
    bloodGroup: "AB_NEGATIVE",
    district: "Rangpur",
    area: "Modern",
    isAvailable: true,
    daysAgoDonated: null,
  },
  {
    name: "Mehidy Hasan Miraz",
    email: "demo.donor9@bloodsync.test",
    phone: "+8801710000009",
    bloodGroup: "O_POSITIVE",
    district: "Sylhet",
    area: "Zindabazar",
    isAvailable: true,
    daysAgoDonated: null,
  },
  {
    name: "Nazmul Hossain Shanto",
    email: "demo.donor10@bloodsync.test",
    phone: "+8801710000010",
    bloodGroup: "A_POSITIVE",
    district: "Comilla",
    area: "Kandirpar",
    isAvailable: true,
    daysAgoDonated: null,
  },
  {
    name: "Shoriful Islam",
    email: "demo.donor11@bloodsync.test",
    phone: "+8801710000011",
    bloodGroup: "B_POSITIVE",
    district: "Gazipur",
    area: "Joydebpur",
    isAvailable: true,
    daysAgoDonated: null,
  },
  {
    name: "Towhid Hridoy",
    email: "demo.donor12@bloodsync.test",
    phone: "+8801710000012",
    bloodGroup: "AB_POSITIVE",
    district: "Dhaka",
    area: "Mirpur",
    isAvailable: true,
    daysAgoDonated: null,
  },
  // 13-14: Eligible (> 90 days since donation) and available
  {
    name: "Nasir Hossain",
    email: "demo.donor13@bloodsync.test",
    phone: "+8801710000013",
    bloodGroup: "O_POSITIVE",
    district: "Chittagong",
    area: "Halishahar",
    isAvailable: true,
    daysAgoDonated: 120, // Eligible
  },
  {
    name: "Anamul Haque Bijoy",
    email: "demo.donor14@bloodsync.test",
    phone: "+8801710000014",
    bloodGroup: "B_POSITIVE",
    district: "Rajshahi",
    area: "Boalia",
    isAvailable: true,
    daysAgoDonated: 105, // Eligible
  },
  // 15-17: Ineligible (< 90 days recovery period) to verify eligibility enforcement
  {
    name: "Taijul Islam",
    email: "demo.donor15@bloodsync.test",
    phone: "+8801710000015",
    bloodGroup: "A_POSITIVE",
    district: "Sylhet",
    area: "Amberkhana",
    isAvailable: true,
    daysAgoDonated: 30, // Ineligible (< 90 days)
  },
  {
    name: "Ebadot Hossain",
    email: "demo.donor16@bloodsync.test",
    phone: "+8801710000016",
    bloodGroup: "B_POSITIVE",
    district: "Khulna",
    area: "Sonadanga",
    isAvailable: true,
    daysAgoDonated: 45, // Ineligible (< 90 days)
  },
  {
    name: "Hasan Mahmud",
    email: "demo.donor17@bloodsync.test",
    phone: "+8801710000017",
    bloodGroup: "O_NEGATIVE",
    district: "Barisal",
    area: "Kotwali",
    isAvailable: true,
    daysAgoDonated: 60, // Ineligible (< 90 days)
  },
  // 18-20: Unavailable donors (isAvailable: false)
  {
    name: "Rony Talukdar",
    email: "demo.donor18@bloodsync.test",
    phone: "+8801710000018",
    bloodGroup: "A_NEGATIVE",
    district: "Rangpur",
    area: "Station",
    isAvailable: false, // Unavailable
    daysAgoDonated: null,
  },
  {
    name: "Soumya Sarkar",
    email: "demo.donor19@bloodsync.test",
    phone: "+8801710000019",
    bloodGroup: "AB_POSITIVE",
    district: "Comilla",
    area: "Laksam",
    isAvailable: false, // Unavailable
    daysAgoDonated: null,
  },
  {
    name: "Mohammad Naim",
    email: "demo.donor20@bloodsync.test",
    phone: "+8801710000020",
    bloodGroup: "B_NEGATIVE",
    district: "Gazipur",
    area: "Tongi",
    isAvailable: false, // Unavailable
    daysAgoDonated: null,
  },
];

// Helper to get or create a user via Better Auth
async function getOrCreateUser(name: string, email: string, password: string): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return existing.id;
  }

  const result = await auth.api.signUpEmail({
    body: { name, email, password },
  });

  if (!result || !result.user) {
    throw new Error(`Failed to create user: ${email}`);
  }

  return result.user.id;
}

async function seedDemoData() {
  const demoPassword = env.DEMO_PASSWORD;
  console.log(`Using shared demo password for demo users: ${demoPassword}`);

  // 1. Seed Demo Donors
  console.log(`\n[1/3] Seeding ${DEMO_DONORS.length} demo donors...`);
  const donorUserIds: Record<string, string> = {};

  for (const donor of DEMO_DONORS) {
    const userId = await getOrCreateUser(donor.name, donor.email, demoPassword);
    donorUserIds[donor.email] = userId;

    const lastDonatedAt = donor.daysAgoDonated
      ? new Date(Date.now() - donor.daysAgoDonated * 24 * 60 * 60 * 1000)
      : null;

    await prisma.donorProfile.upsert({
      where: { userId },
      update: {
        bloodGroup: donor.bloodGroup,
        district: donor.district,
        area: donor.area,
        phone: donor.phone,
        isAvailable: donor.isAvailable,
        lastDonatedAt,
      },
      create: {
        userId,
        bloodGroup: donor.bloodGroup,
        district: donor.district,
        area: donor.area,
        phone: donor.phone,
        isAvailable: donor.isAvailable,
        lastDonatedAt,
      },
    });
  }
  console.log(`Created / verified ${DEMO_DONORS.length} donor profiles.`);

  // 2. Seed 2 Demo Requesters
  console.log(`\n[2/3] Seeding 2 demo requesters...`);
  const requester1Id = await getOrCreateUser(
    "Demo Requester One",
    "demo.requester1@bloodsync.test",
    demoPassword
  );
  const requester2Id = await getOrCreateUser(
    "Demo Requester Two",
    "demo.requester2@bloodsync.test",
    demoPassword
  );
  console.log(`Requesters ready: demo.requester1@bloodsync.test and demo.requester2@bloodsync.test`);

  // 3. Seed 4 Blood Requests in different statuses
  console.log(`\n[3/3] Seeding 4 blood requests across OPEN, MATCHED, FULFILLED, EXPIRED...`);

  // Request 1: OPEN (Requester 1)
  const req1NeededBy = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const req1 = await prisma.bloodRequest.upsert({
    where: { id: "demo-req-open-01" },
    update: {
      requesterId: requester1Id,
      patientName: "Tanvir Hasan",
      bloodGroup: "B_POSITIVE",
      unitsNeeded: 2,
      hospital: "Dhaka Medical College Hospital",
      district: "Dhaka",
      area: "Shahbagh",
      urgency: "URGENT",
      neededBy: req1NeededBy,
      contactPhone: "+8801810000001",
      note: "Urgent need for thalassemia patient. Blood required before surgery.",
      forSelf: false,
      status: "OPEN",
    },
    create: {
      id: "demo-req-open-01",
      requesterId: requester1Id,
      patientName: "Tanvir Hasan",
      bloodGroup: "B_POSITIVE",
      unitsNeeded: 2,
      hospital: "Dhaka Medical College Hospital",
      district: "Dhaka",
      area: "Shahbagh",
      urgency: "URGENT",
      neededBy: req1NeededBy,
      contactPhone: "+8801810000001",
      note: "Urgent need for thalassemia patient. Blood required before surgery.",
      forSelf: false,
      status: "OPEN",
    },
  });

  // Request 2: MATCHED (Requester 1) with 1 accepted donation
  const req2NeededBy = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const req2 = await prisma.bloodRequest.upsert({
    where: { id: "demo-req-matched-02" },
    update: {
      requesterId: requester1Id,
      patientName: "Ayesha Siddiqua",
      bloodGroup: "O_POSITIVE",
      unitsNeeded: 1,
      hospital: "Chittagong Medical College Hospital",
      district: "Chittagong",
      area: "Panchlaish",
      urgency: "CRITICAL",
      neededBy: req2NeededBy,
      contactPhone: "+8801810000002",
      note: "Post-accident trauma patient in ICU. 1 unit matched.",
      forSelf: true,
      status: "MATCHED",
    },
    create: {
      id: "demo-req-matched-02",
      requesterId: requester1Id,
      patientName: "Ayesha Siddiqua",
      bloodGroup: "O_POSITIVE",
      unitsNeeded: 1,
      hospital: "Chittagong Medical College Hospital",
      district: "Chittagong",
      area: "Panchlaish",
      urgency: "CRITICAL",
      neededBy: req2NeededBy,
      contactPhone: "+8801810000002",
      note: "Post-accident trauma patient in ICU. 1 unit matched.",
      forSelf: true,
      status: "MATCHED",
    },
  });

  // Link an ACCEPTED donation to req2 from demo.donor1 (O+)
  await prisma.donation.upsert({
    where: {
      requestId_donorId: {
        requestId: req2.id,
        donorId: donorUserIds["demo.donor1@bloodsync.test"],
      },
    },
    update: { status: "ACCEPTED" },
    create: {
      requestId: req2.id,
      donorId: donorUserIds["demo.donor1@bloodsync.test"],
      status: "ACCEPTED",
    },
  });

  // Request 3: FULFILLED (Requester 2) with 1 completed donation
  const req3NeededBy = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const req3 = await prisma.bloodRequest.upsert({
    where: { id: "demo-req-fulfilled-03" },
    update: {
      requesterId: requester2Id,
      patientName: "Karim Ullah",
      bloodGroup: "A_POSITIVE",
      unitsNeeded: 1,
      hospital: "Rajshahi Medical College Hospital",
      district: "Rajshahi",
      area: "Laxmipur",
      urgency: "NORMAL",
      neededBy: req3NeededBy,
      contactPhone: "+8801810000003",
      note: "Routine dialysis blood replacement completed.",
      forSelf: false,
      status: "FULFILLED",
    },
    create: {
      id: "demo-req-fulfilled-03",
      requesterId: requester2Id,
      patientName: "Karim Ullah",
      bloodGroup: "A_POSITIVE",
      unitsNeeded: 1,
      hospital: "Rajshahi Medical College Hospital",
      district: "Rajshahi",
      area: "Laxmipur",
      urgency: "NORMAL",
      neededBy: req3NeededBy,
      contactPhone: "+8801810000003",
      note: "Routine dialysis blood replacement completed.",
      forSelf: false,
      status: "FULFILLED",
    },
  });

  // Link a COMPLETED donation to req3 from demo.donor2 (A+)
  await prisma.donation.upsert({
    where: {
      requestId_donorId: {
        requestId: req3.id,
        donorId: donorUserIds["demo.donor2@bloodsync.test"],
      },
    },
    update: { status: "COMPLETED" },
    create: {
      requestId: req3.id,
      donorId: donorUserIds["demo.donor2@bloodsync.test"],
      status: "COMPLETED",
    },
  });

  // Request 4: EXPIRED (Requester 2) with past neededBy date
  const req4NeededBy = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  await prisma.bloodRequest.upsert({
    where: { id: "demo-req-expired-04" },
    update: {
      requesterId: requester2Id,
      patientName: "Nasir Khan",
      bloodGroup: "AB_NEGATIVE",
      unitsNeeded: 1,
      hospital: "MAG Osmani Medical College Hospital",
      district: "Sylhet",
      area: "Kajolshah",
      urgency: "NORMAL",
      neededBy: req4NeededBy,
      contactPhone: "+8801810000004",
      note: "Expired request from last week.",
      forSelf: false,
      status: "EXPIRED",
    },
    create: {
      id: "demo-req-expired-04",
      requesterId: requester2Id,
      patientName: "Nasir Khan",
      bloodGroup: "AB_NEGATIVE",
      unitsNeeded: 1,
      hospital: "MAG Osmani Medical College Hospital",
      district: "Sylhet",
      area: "Kajolshah",
      urgency: "NORMAL",
      neededBy: req4NeededBy,
      contactPhone: "+8801810000004",
      note: "Expired request from last week.",
      forSelf: false,
      status: "EXPIRED",
    },
  });

  console.log("Seeded requests in OPEN, MATCHED, FULFILLED, and EXPIRED statuses.");
  console.log("\n[Done] Demo seed completed successfully!");
}

seedDemoData()
  .catch((err) => {
    console.error("Demo seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

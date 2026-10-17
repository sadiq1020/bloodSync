import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { isEligible, getNextEligibleDate } from "../../lib/eligibility.js";
import type { BloodGroup } from "@prisma/client";
import type { CreateDonorInput, UpdateDonorInput, SearchDonorQuery } from "./donor.validation.js";

// Map human-readable blood group strings to Prisma enum keys
const BLOOD_GROUP_TO_ENUM: Record<string, BloodGroup> = {
  "A+":  "A_POSITIVE",
  "A-":  "A_NEGATIVE",
  "B+":  "B_POSITIVE",
  "B-":  "B_NEGATIVE",
  "AB+": "AB_POSITIVE",
  "AB-": "AB_NEGATIVE",
  "O+":  "O_POSITIVE",
  "O-":  "O_NEGATIVE",
};

// Create a new donor profile; throws 409 if one already exists
export const createDonorProfile = async (userId: string, data: CreateDonorInput) => {
  const existing = await prisma.donorProfile.findUnique({ where: { userId } });
  if (existing) {
    throw new AppError("Donor profile already exists. Use PATCH to update it.", 409);
  }

  return prisma.donorProfile.create({
    data: {
      userId,
      bloodGroup: BLOOD_GROUP_TO_ENUM[data.bloodGroup],
      district: data.district,
      area: data.area,
      phone: data.phone,
      lastDonatedAt: data.lastDonatedAt ?? null,
    },
    select: {
      id: true,
      bloodGroup: true,
      district: true,
      area: true,
      phone: true,
      isAvailable: true,
      lastDonatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// Return my donor profile enriched with eligibility info; throws 404 if not found
export const getMyDonorProfile = async (userId: string) => {
  const profile = await prisma.donorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      bloodGroup: true,
      district: true,
      area: true,
      phone: true,
      isAvailable: true,
      lastDonatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!profile) {
    throw new AppError("Donor profile not found.", 404);
  }

  return {
    ...profile,
    isEligible: isEligible(profile.lastDonatedAt),
    nextEligibleDate: getNextEligibleDate(profile.lastDonatedAt),
  };
};

// Partially update donor profile; throws 404 if not found
export const updateDonorProfile = async (userId: string, data: UpdateDonorInput) => {
  const existing = await prisma.donorProfile.findUnique({ where: { userId } });
  if (!existing) {
    throw new AppError("Donor profile not found. Create one first.", 404);
  }

  return prisma.donorProfile.update({
    where: { userId },
    data: {
      ...(data.bloodGroup !== undefined && {
        bloodGroup: BLOOD_GROUP_TO_ENUM[data.bloodGroup],
      }),
      ...(data.district !== undefined && { district: data.district }),
      ...(data.area !== undefined && { area: data.area }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      ...(data.lastDonatedAt !== undefined && { lastDonatedAt: data.lastDonatedAt }),
    },
    select: {
      id: true,
      bloodGroup: true,
      district: true,
      area: true,
      phone: true,
      isAvailable: true,
      lastDonatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// Search available + eligible donors; never returns phone or email
export const searchDonors = async (query: SearchDonorQuery) => {
  const { bloodGroup, district, area, page, limit } = query;
  const skip = (page - 1) * limit;

  // Calculate cutoff date: eligible means lastDonatedAt IS NULL or >= 90 days ago
  const eligibilityCutoff = new Date();
  eligibilityCutoff.setDate(eligibilityCutoff.getDate() - 90);

  const where = {
    isAvailable: true,
    // Eligible: never donated OR donated more than 90 days ago
    OR: [
      { lastDonatedAt: null },
      { lastDonatedAt: { lte: eligibilityCutoff } },
    ],
    ...(bloodGroup && { bloodGroup: BLOOD_GROUP_TO_ENUM[bloodGroup] }),
    ...(district && { district }),
    ...(area && {
      area: { contains: area, mode: "insensitive" as const },
    }),
  };

  const [total, donors] = await Promise.all([
    prisma.donorProfile.count({ where }),
    prisma.donorProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        // NEVER include phone here
        bloodGroup: true,
        district: true,
        area: true,
        lastDonatedAt: true,
        user: {
          select: {
            name: true,
            // email is intentionally omitted
          },
        },
      },
    }),
  ]);

  return {
    data: donors,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

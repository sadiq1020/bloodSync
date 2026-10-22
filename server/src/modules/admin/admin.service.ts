import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { expireOverdueRequests } from "../request/request.service.js";
import type { BloodGroup, Prisma } from "@prisma/client";
import type {
  ListUsersQuery,
  ListAdminRequestsQuery,
} from "./admin.validation.js";

// Map human-readable blood groups to Prisma enum keys
const BLOOD_GROUP_TO_ENUM: Record<string, BloodGroup> = {
  "A+": "A_POSITIVE",
  "A-": "A_NEGATIVE",
  "B+": "B_POSITIVE",
  "B-": "B_NEGATIVE",
  "AB+": "AB_POSITIVE",
  "AB-": "AB_NEGATIVE",
  "O+": "O_POSITIVE",
  "O-": "O_NEGATIVE",
};

// Map Prisma enum keys to human-readable blood group strings
const ENUM_TO_BLOOD_GROUP: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

// List users with search, role, isBlocked filters, pagination, and hasDonorProfile boolean
export const listUsers = async (query: ListUsersQuery) => {
  const { search, role, isBlocked, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (isBlocked !== undefined) {
    where.isBlocked = isBlocked;
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        donorProfile: {
          select: {
            id: true,
          },
        },
      },
    }),
  ]);

  const formattedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isBlocked: u.isBlocked,
    createdAt: u.createdAt,
    hasDonorProfile: Boolean(u.donorProfile),
  }));

  return {
    data: formattedUsers,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Block or unblock a user; deleting active sessions immediately upon blocking
export const blockUser = async (
  currentAdminId: string,
  targetUserId: string,
  isBlocked: boolean
) => {
  if (currentAdminId === targetUserId) {
    throw new AppError("You cannot block your own account.", 403);
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw new AppError("User not found.", 404);
  }

  if (targetUser.role === "ADMIN") {
    throw new AppError("You cannot block another admin.", 403);
  }

  if (isBlocked) {
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: targetUserId },
        data: { isBlocked: true },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.session.deleteMany({
        where: { userId: targetUserId },
      }),
    ]);

    return updatedUser;
  }

  return prisma.user.update({
    where: { id: targetUserId },
    data: { isBlocked: false },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// List all requests with donation status counts and requester details
export const listAdminRequests = async (query: ListAdminRequestsQuery) => {
  await expireOverdueRequests();

  const { status, district, bloodGroup, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.BloodRequestWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (district) {
    where.district = district;
  }

  if (bloodGroup) {
    where.bloodGroup = BLOOD_GROUP_TO_ENUM[bloodGroup];
  }

  const [total, requests] = await Promise.all([
    prisma.bloodRequest.count({ where }),
    prisma.bloodRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        donations: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    }),
  ]);

  const formattedRequests = requests.map((req) => {
    const donationCounts = {
      PENDING: 0,
      ACCEPTED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      total: req.donations.length,
    };

    for (const d of req.donations) {
      if (donationCounts[d.status] !== undefined) {
        donationCounts[d.status] += 1;
      }
    }

    const { donations, ...rest } = req;
    return {
      ...rest,
      donationCounts,
    };
  });

  return {
    data: formattedRequests,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Admin close: sets request status to CANCELLED and cancels pending/accepted donations
export const closeAdminRequest = async (requestId: string) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError("Blood request not found.", 404);
  }

  if (request.status !== "OPEN" && request.status !== "MATCHED") {
    throw new AppError(
      `Cannot close request with status ${request.status}. Only OPEN or MATCHED requests can be closed.`,
      400
    );
  }

  const [updatedRequest] = await prisma.$transaction([
    prisma.bloodRequest.update({
      where: { id: requestId },
      data: { status: "CANCELLED" },
    }),
    prisma.donation.updateMany({
      where: {
        requestId,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
      data: { status: "CANCELLED" },
    }),
  ]);

  return updatedRequest;
};

// Hard delete an abusive or fake request along with all its donations
export const deleteAdminRequest = async (requestId: string) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError("Blood request not found.", 404);
  }

  await prisma.$transaction([
    prisma.donation.deleteMany({
      where: { requestId },
    }),
    prisma.bloodRequest.delete({
      where: { id: requestId },
    }),
  ]);

  return { message: "Blood request and its donations deleted successfully." };
};

// System statistics aggregated with count and groupBy
export const getAdminStats = async () => {
  await expireOverdueRequests();

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    blockedUsers,
    totalDonors,
    availableEligibleDonors,
    donationsCompleted,
    requestsGroup,
    donorsGroup,
    districtsGroup,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isBlocked: true } }),
    prisma.donorProfile.count(),
    prisma.donorProfile.count({
      where: {
        isAvailable: true,
        OR: [
          { lastDonatedAt: null },
          { lastDonatedAt: { lte: ninetyDaysAgo } },
        ],
      },
    }),
    prisma.donation.count({ where: { status: "COMPLETED" } }),
    prisma.bloodRequest.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.donorProfile.groupBy({
      by: ["bloodGroup"],
      _count: { bloodGroup: true },
    }),
    prisma.bloodRequest.groupBy({
      by: ["district"],
      where: { status: "OPEN" },
      _count: { district: true },
      orderBy: {
        _count: {
          district: "desc",
        },
      },
      take: 5,
    }),
  ]);

  const requestsByStatus: Record<string, number> = {
    OPEN: 0,
    MATCHED: 0,
    FULFILLED: 0,
    EXPIRED: 0,
    CANCELLED: 0,
  };
  for (const item of requestsGroup) {
    requestsByStatus[item.status] = item._count.status;
  }

  const donorsByBloodGroup: Record<string, number> = {
    "A+": 0,
    "A-": 0,
    "B+": 0,
    "B-": 0,
    "AB+": 0,
    "AB-": 0,
    "O+": 0,
    "O-": 0,
  };
  for (const item of donorsGroup) {
    const readable = ENUM_TO_BLOOD_GROUP[item.bloodGroup] || item.bloodGroup;
    donorsByBloodGroup[readable] = item._count.bloodGroup;
  }

  const topDistricts = districtsGroup.map((item) => ({
    district: item.district,
    count: item._count.district,
  }));

  return {
    totalUsers,
    blockedUsers,
    totalDonors,
    availableEligibleDonors,
    requestsByStatus,
    donationsCompleted,
    donorsByBloodGroup,
    topDistricts,
  };
};

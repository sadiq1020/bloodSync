import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { BloodGroup, Role } from "@prisma/client";
import type {
  CreateRequestInput,
  ListRequestsQuery,
  MineRequestsQuery,
} from "./request.validation.js";

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

// Helper: Mark past-due OPEN or MATCHED requests as EXPIRED
export const expireOverdueRequests = async () => {
  return prisma.bloodRequest.updateMany({
    where: {
      status: { in: ["OPEN", "MATCHED"] },
      neededBy: { lt: new Date() },
    },
    data: {
      status: "EXPIRED",
    },
  });
};

// Create a new blood request (status defaults to OPEN)
export const createRequest = async (userId: string, data: CreateRequestInput) => {
  return prisma.bloodRequest.create({
    data: {
      requesterId: userId,
      patientName: data.patientName,
      bloodGroup: BLOOD_GROUP_TO_ENUM[data.bloodGroup],
      unitsNeeded: data.unitsNeeded,
      hospital: data.hospital,
      district: data.district,
      area: data.area,
      urgency: data.urgency,
      neededBy: data.neededBy,
      contactPhone: data.contactPhone,
      note: data.note ?? null,
      forSelf: data.forSelf,
      status: "OPEN",
    },
    select: {
      id: true,
      requesterId: true,
      patientName: true,
      bloodGroup: true,
      unitsNeeded: true,
      hospital: true,
      district: true,
      area: true,
      urgency: true,
      neededBy: true,
      contactPhone: true,
      note: true,
      forSelf: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// Feed: list requests with filters and pagination; omits contactPhone
export const listRequests = async (query: ListRequestsQuery) => {
  await expireOverdueRequests();

  const { district, bloodGroup, urgency, status, page, limit } = query;
  const skip = (page - 1) * limit;

  const where = {
    status,
    ...(district && { district }),
    ...(bloodGroup && { bloodGroup: BLOOD_GROUP_TO_ENUM[bloodGroup] }),
    ...(urgency && { urgency }),
  };

  const [total, requests] = await Promise.all([
    prisma.bloodRequest.count({ where }),
    prisma.bloodRequest.findMany({
      where,
      skip,
      take: limit,
      // Postgres enum order: CRITICAL > URGENT > NORMAL when sorted DESC
      orderBy: [{ urgency: "desc" }, { neededBy: "asc" }],
      select: {
        id: true,
        requesterId: true,
        patientName: true,
        bloodGroup: true,
        unitsNeeded: true,
        hospital: true,
        district: true,
        area: true,
        urgency: true,
        neededBy: true,
        // contactPhone is intentionally omitted from the public list
        note: true,
        forSelf: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        requester: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  return {
    data: requests,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Personal requests list: includes status filter and count of donations per status
export const getMyRequests = async (userId: string, query: MineRequestsQuery) => {
  await expireOverdueRequests();

  const { status, page, limit } = query;
  const skip = (page - 1) * limit;

  const where = {
    requesterId: userId,
    ...(status && { status }),
  };

  const [total, requests] = await Promise.all([
    prisma.bloodRequest.count({ where }),
    prisma.bloodRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        donations: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    }),
  ]);

  // Transform each request to aggregate donation counts by status
  const formattedRequests = requests.map((req) => {
    const donationCounts = {
      PENDING: 0,
      ACCEPTED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      total: req.donations.length,
    };

    for (const donation of req.donations) {
      if (donationCounts[donation.status] !== undefined) {
        donationCounts[donation.status] += 1;
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

// Request details: reveals contactPhone only to owner, admin, or accepted/completed donor
export const getRequestById = async (
  id: string,
  user: { id: string; role: Role | string }
) => {
  await expireOverdueRequests();

  const request = await prisma.bloodRequest.findUnique({
    where: { id },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      donations: {
        where: {
          donorId: user.id,
        },
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!request) {
    throw new AppError("Blood request not found.", 404);
  }

  const isOwner = request.requesterId === user.id;
  const isAdmin = user.role === "ADMIN";
  const hasAcceptedOrCompletedDonation = request.donations.some(
    (d) => d.status === "ACCEPTED" || d.status === "COMPLETED"
  );

  const canViewContactPhone = isOwner || isAdmin || hasAcceptedOrCompletedDonation;

  const { contactPhone, donations, ...rest } = request;

  return {
    ...rest,
    ...(canViewContactPhone ? { contactPhone } : {}),
  };
};

// Cancel request: only owner, only if OPEN or MATCHED; cancels pending & accepted donations in transaction
export const cancelRequest = async (id: string, userId: string) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new AppError("Blood request not found.", 404);
  }

  if (request.requesterId !== userId) {
    throw new AppError("You are not authorized to cancel this request.", 403);
  }

  if (request.status !== "OPEN" && request.status !== "MATCHED") {
    throw new AppError(
      `Cannot cancel request with status ${request.status}. Only OPEN or MATCHED requests can be cancelled.`,
      400
    );
  }

  const [updatedRequest] = await prisma.$transaction([
    prisma.bloodRequest.update({
      where: { id },
      data: { status: "CANCELLED" },
    }),
    prisma.donation.updateMany({
      where: {
        requestId: id,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
      data: { status: "CANCELLED" },
    }),
  ]);

  return updatedRequest;
};

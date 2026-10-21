import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { canDonateTo, type BloodGroup } from "../../lib/bloodCompatibility.js";
import { isEligible } from "../../lib/eligibility.js";

// Helper mappings between Prisma enum keys and readable blood groups
const ENUM_TO_BLOOD_GROUP: Record<string, BloodGroup> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

// POST /api/requests/:id/volunteer: Volunteer to donate for an open blood request
export const volunteerToDonate = async (requestId: string, userId: string) => {
  // 1. Request must exist
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) {
    throw new AppError("Blood request not found.", 404);
  }

  // 2. Cannot volunteer for own request
  if (request.requesterId === userId) {
    throw new AppError("You cannot volunteer to donate for your own request.", 400);
  }

  // 3. Request status must be OPEN and not past neededBy
  if (request.status !== "OPEN") {
    throw new AppError(
      `Cannot volunteer for a request with status ${request.status}. Only OPEN requests accept volunteers.`,
      400
    );
  }
  if (new Date(request.neededBy) < new Date()) {
    throw new AppError("This blood request has passed its needed date.", 400);
  }

  // 4. Must have an available and eligible donor profile
  const donorProfile = await prisma.donorProfile.findUnique({
    where: { userId },
  });
  if (!donorProfile) {
    throw new AppError("You must create a donor profile before volunteering to donate.", 400);
  }
  if (!donorProfile.isAvailable) {
    throw new AppError("Your donor profile is currently set to unavailable.", 400);
  }
  if (!isEligible(donorProfile.lastDonatedAt)) {
    throw new AppError(
      "You are not eligible to donate blood yet. Please wait for the 90-day recovery period.",
      400
    );
  }

  // 5. Blood group must be compatible
  const donorGroup = ENUM_TO_BLOOD_GROUP[donorProfile.bloodGroup];
  const patientGroup = ENUM_TO_BLOOD_GROUP[request.bloodGroup];
  if (!canDonateTo(donorGroup, patientGroup)) {
    throw new AppError(
      `Your blood group (${donorGroup}) is not compatible with the patient's blood group (${patientGroup}).`,
      400
    );
  }

  // 6. Cannot volunteer twice for the same request
  const existingDonation = await prisma.donation.findUnique({
    where: {
      requestId_donorId: {
        requestId,
        donorId: userId,
      },
    },
  });
  if (existingDonation) {
    throw new AppError("You have already volunteered for this blood request.", 409);
  }

  // 7. Create donation with status PENDING
  return prisma.donation.create({
    data: {
      requestId,
      donorId: userId,
      status: "PENDING",
    },
    include: {
      request: {
        select: {
          id: true,
          patientName: true,
          bloodGroup: true,
          hospital: true,
          district: true,
          area: true,
          urgency: true,
          status: true,
        },
      },
    },
  });
};

// PATCH /api/donations/:id/accept: Owner accepts a pending donation
export const acceptDonation = async (donationId: string, userId: string) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { request: true },
  });

  if (!donation) {
    throw new AppError("Donation not found.", 404);
  }

  if (donation.request.requesterId !== userId) {
    throw new AppError("Only the request owner can accept this donation.", 403);
  }

  if (donation.status !== "PENDING") {
    throw new AppError(
      `Cannot accept donation with status ${donation.status}. Only PENDING donations can be accepted.`,
      400
    );
  }

  return prisma.$transaction(async (tx) => {
    const updatedDonation = await tx.donation.update({
      where: { id: donationId },
      data: { status: "ACCEPTED" },
    });

    const acceptedOrCompletedCount = await tx.donation.count({
      where: {
        requestId: donation.requestId,
        status: { in: ["ACCEPTED", "COMPLETED"] },
      },
    });

    if (acceptedOrCompletedCount >= donation.request.unitsNeeded) {
      await tx.bloodRequest.update({
        where: { id: donation.requestId },
        data: { status: "MATCHED" },
      });
    }

    return updatedDonation;
  });
};

// PATCH /api/donations/:id/complete: Owner marks an accepted donation completed
export const completeDonation = async (donationId: string, userId: string) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { request: true },
  });

  if (!donation) {
    throw new AppError("Donation not found.", 404);
  }

  if (donation.request.requesterId !== userId) {
    throw new AppError("Only the request owner can mark this donation as completed.", 403);
  }

  if (donation.status !== "ACCEPTED") {
    throw new AppError(
      `Cannot complete donation with status ${donation.status}. Only ACCEPTED donations can be completed.`,
      400
    );
  }

  return prisma.$transaction(async (tx) => {
    const updatedDonation = await tx.donation.update({
      where: { id: donationId },
      data: { status: "COMPLETED" },
    });

    // Update donor profile lastDonatedAt to now
    await tx.donorProfile.update({
      where: { userId: donation.donorId },
      data: { lastDonatedAt: new Date() },
    });

    // Count completed donations
    const completedCount = await tx.donation.count({
      where: {
        requestId: donation.requestId,
        status: "COMPLETED",
      },
    });

    // If unitsNeeded reached, mark FULFILLED and cancel remaining PENDING donations
    if (completedCount >= donation.request.unitsNeeded) {
      await tx.bloodRequest.update({
        where: { id: donation.requestId },
        data: { status: "FULFILLED" },
      });

      await tx.donation.updateMany({
        where: {
          requestId: donation.requestId,
          status: "PENDING",
        },
        data: { status: "CANCELLED" },
      });
    }

    return updatedDonation;
  });
};

// PATCH /api/donations/:id/cancel: Donor or owner cancels/withdraws donation
export const cancelDonation = async (donationId: string, userId: string) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { request: true },
  });

  if (!donation) {
    throw new AppError("Donation not found.", 404);
  }

  const isDonor = donation.donorId === userId;
  const isOwner = donation.request.requesterId === userId;

  if (!isDonor && !isOwner) {
    throw new AppError("Only the donor or the request owner can cancel this donation.", 403);
  }

  if (donation.status !== "PENDING" && donation.status !== "ACCEPTED") {
    throw new AppError(
      `Cannot cancel donation with status ${donation.status}. Only PENDING or ACCEPTED donations can be cancelled.`,
      400
    );
  }

  return prisma.$transaction(async (tx) => {
    const updatedDonation = await tx.donation.update({
      where: { id: donationId },
      data: { status: "CANCELLED" },
    });

    // If request was MATCHED, check if accepted + completed count dropped below unitsNeeded
    if (donation.request.status === "MATCHED") {
      const remainingCount = await tx.donation.count({
        where: {
          requestId: donation.requestId,
          status: { in: ["ACCEPTED", "COMPLETED"] },
        },
      });

      if (remainingCount < donation.request.unitsNeeded) {
        await tx.bloodRequest.update({
          where: { id: donation.requestId },
          data: { status: "OPEN" },
        });
      }
    }

    return updatedDonation;
  });
};

// GET /api/requests/:id/donations: Request owner or admin views volunteers
export const getRequestDonations = async (
  requestId: string,
  user: { id: string; role: string }
) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError("Blood request not found.", 404);
  }

  if (request.requesterId !== user.id && user.role !== "ADMIN") {
    throw new AppError("Only the request owner or an admin can view volunteers.", 403);
  }

  const donations = await prisma.donation.findMany({
    where: { requestId },
    include: {
      donor: {
        select: {
          id: true,
          name: true,
          donorProfile: {
            select: {
              bloodGroup: true,
              district: true,
              area: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return donations.map((d) => ({
    id: d.id,
    requestId: d.requestId,
    donorId: d.donorId,
    status: d.status,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    donorName: d.donor.name,
    bloodGroup: d.donor.donorProfile
      ? ENUM_TO_BLOOD_GROUP[d.donor.donorProfile.bloodGroup] ?? d.donor.donorProfile.bloodGroup
      : null,
    district: d.donor.donorProfile?.district ?? null,
    area: d.donor.donorProfile?.area ?? null,
    phone: d.donor.donorProfile?.phone ?? null,
  }));
};

// GET /api/donations/mine: Logged-in user's own donations with request summary
export const getMyDonations = async (userId: string) => {
  const donations = await prisma.donation.findMany({
    where: { donorId: userId },
    include: {
      request: {
        select: {
          id: true,
          patientName: true,
          bloodGroup: true,
          unitsNeeded: true,
          hospital: true,
          district: true,
          area: true,
          urgency: true,
          neededBy: true,
          status: true,
          requester: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return donations.map((d) => ({
    ...d,
    request: {
      ...d.request,
      bloodGroup: ENUM_TO_BLOOD_GROUP[d.request.bloodGroup] ?? d.request.bloodGroup,
    },
  }));
};

import { prisma } from "../../config/prisma.js";

// Service retrieving detailed user profile along with active donor status
export const getUserProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
      image: true,
      createdAt: true,
      donorProfile: {
        select: {
          id: true,
          bloodGroup: true,
          district: true,
          area: true,
          phone: true,
          isAvailable: true,
          lastDonatedAt: true,
        },
      },
    },
  });
};

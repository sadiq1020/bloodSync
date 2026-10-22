import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../config/prisma.js";
import {
  listUsers,
  blockUser,
  closeAdminRequest,
  deleteAdminRequest,
  getAdminStats,
} from "../modules/admin/admin.service.js";
import {
  listUsersQuerySchema,
  blockUserBodySchema,
  listAdminRequestsQuerySchema,
} from "../modules/admin/admin.validation.js";

// Mock prisma and request service functions
vi.mock("../modules/request/request.service.js", () => ({
  expireOverdueRequests: vi.fn().mockResolvedValue({ count: 0 }),
}));

vi.mock("../config/prisma.js", () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
        findMany: vi.fn(),
      },
      session: {
        deleteMany: vi.fn(),
      },
      bloodRequest: {
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
        findMany: vi.fn(),
        groupBy: vi.fn(),
      },
      donation: {
        updateMany: vi.fn(),
        deleteMany: vi.fn(),
        count: vi.fn(),
      },
      donorProfile: {
        count: vi.fn(),
        groupBy: vi.fn(),
      },
      $transaction: vi.fn(async (arg: any) => {
        if (Array.isArray(arg)) {
          return Promise.all(arg);
        }
        if (typeof arg === "function") {
          return arg(prisma);
        }
        return arg;
      }),
    },
  };
});

describe("Admin Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validation Schemas", () => {
    it("validates listUsersQuery pagination defaults and limits", () => {
      const parsed = listUsersQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);

      const parsedCustom = listUsersQuerySchema.parse({
        page: "2",
        limit: "25",
        search: "John",
        role: "ADMIN",
        isBlocked: "true",
      });
      expect(parsedCustom.page).toBe(2);
      expect(parsedCustom.limit).toBe(25);
      expect(parsedCustom.search).toBe("John");
      expect(parsedCustom.role).toBe("ADMIN");
      expect(parsedCustom.isBlocked).toBe(true);
    });

    it("rejects invalid role or limit in listUsersQuery", () => {
      expect(() =>
        listUsersQuerySchema.parse({ role: "SUPERADMIN" })
      ).toThrow();
      expect(() => listUsersQuerySchema.parse({ limit: "100" })).toThrow();
    });

    it("validates blockUserBodySchema", () => {
      const parsed = blockUserBodySchema.parse({ isBlocked: true });
      expect(parsed.isBlocked).toBe(true);

      expect(() => blockUserBodySchema.parse({})).toThrow();
      expect(() => blockUserBodySchema.parse({ isBlocked: "yes" })).toThrow();
    });

    it("normalizes blood group query with space to +", () => {
      const parsed = listAdminRequestsQuerySchema.parse({
        bloodGroup: "A ",
        status: "open",
      });
      expect(parsed.bloodGroup).toBe("A+");
      expect(parsed.status).toBe("OPEN");
    });
  });

  describe("blockUser", () => {
    it("throws 403 when an admin tries to block themselves", async () => {
      await expect(blockUser("admin-1", "admin-1", true)).rejects.toMatchObject({
        statusCode: 403,
        message: "You cannot block your own account.",
      });
    });

    it("throws 404 when the target user does not exist", async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce(null);

      await expect(blockUser("admin-1", "user-404", true)).rejects.toMatchObject({
        statusCode: 404,
        message: "User not found.",
      });
    });

    it("throws 403 when trying to block another admin", async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: "admin-2",
        role: "ADMIN",
      });

      await expect(blockUser("admin-1", "admin-2", true)).rejects.toMatchObject({
        statusCode: 403,
        message: "You cannot block another admin.",
      });
    });

    it("blocks a normal user and removes their active sessions in a transaction", async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: "user-2",
        role: "USER",
      });
      (prisma.user.update as any).mockResolvedValueOnce({
        id: "user-2",
        isBlocked: true,
      });
      (prisma.session.deleteMany as any).mockResolvedValueOnce({ count: 2 });

      const result = await blockUser("admin-1", "user-2", true);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-2" },
          data: { isBlocked: true },
        })
      );
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-2" },
      });
      expect(result.isBlocked).toBe(true);
    });

    it("unblocks a user without deleting sessions", async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: "user-2",
        role: "USER",
      });
      (prisma.user.update as any).mockResolvedValueOnce({
        id: "user-2",
        isBlocked: false,
      });

      const result = await blockUser("admin-1", "user-2", false);

      expect(prisma.session.deleteMany).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-2" },
          data: { isBlocked: false },
        })
      );
      expect(result.isBlocked).toBe(false);
    });
  });

  describe("closeAdminRequest", () => {
    it("throws 404 if request does not exist", async () => {
      (prisma.bloodRequest.findUnique as any).mockResolvedValueOnce(null);

      await expect(closeAdminRequest("req-404")).rejects.toMatchObject({
        statusCode: 404,
        message: "Blood request not found.",
      });
    });

    it("throws 400 if request is already CANCELLED or FULFILLED", async () => {
      (prisma.bloodRequest.findUnique as any).mockResolvedValueOnce({
        id: "req-1",
        status: "FULFILLED",
      });

      await expect(closeAdminRequest("req-1")).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("closes an OPEN request and cancels PENDING/ACCEPTED donations in transaction", async () => {
      (prisma.bloodRequest.findUnique as any).mockResolvedValueOnce({
        id: "req-1",
        status: "OPEN",
      });
      (prisma.bloodRequest.update as any).mockResolvedValueOnce({
        id: "req-1",
        status: "CANCELLED",
      });
      (prisma.donation.updateMany as any).mockResolvedValueOnce({ count: 1 });

      const result = await closeAdminRequest("req-1");

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.bloodRequest.update).toHaveBeenCalledWith({
        where: { id: "req-1" },
        data: { status: "CANCELLED" },
      });
      expect(prisma.donation.updateMany).toHaveBeenCalledWith({
        where: {
          requestId: "req-1",
          status: { in: ["PENDING", "ACCEPTED"] },
        },
        data: { status: "CANCELLED" },
      });
      expect(result.status).toBe("CANCELLED");
    });
  });

  describe("deleteAdminRequest", () => {
    it("throws 404 if request not found", async () => {
      (prisma.bloodRequest.findUnique as any).mockResolvedValueOnce(null);

      await expect(deleteAdminRequest("req-404")).rejects.toMatchObject({
        statusCode: 404,
        message: "Blood request not found.",
      });
    });

    it("deletes donations and request in a transaction", async () => {
      (prisma.bloodRequest.findUnique as any).mockResolvedValueOnce({
        id: "req-1",
      });
      (prisma.donation.deleteMany as any).mockResolvedValueOnce({ count: 2 });
      (prisma.bloodRequest.delete as any).mockResolvedValueOnce({ id: "req-1" });

      const result = await deleteAdminRequest("req-1");

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.donation.deleteMany).toHaveBeenCalledWith({
        where: { requestId: "req-1" },
      });
      expect(prisma.bloodRequest.delete).toHaveBeenCalledWith({
        where: { id: "req-1" },
      });
      expect(result.message).toContain("deleted successfully");
    });
  });

  describe("listUsers", () => {
    it("returns formatted users with hasDonorProfile boolean", async () => {
      (prisma.user.count as any).mockResolvedValueOnce(2);
      (prisma.user.findMany as any).mockResolvedValueOnce([
        {
          id: "u1",
          name: "Alice",
          email: "alice@test.com",
          role: "USER",
          isBlocked: false,
          createdAt: new Date(),
          donorProfile: { id: "dp1" },
        },
        {
          id: "u2",
          name: "Bob",
          email: "bob@test.com",
          role: "USER",
          isBlocked: true,
          createdAt: new Date(),
          donorProfile: null,
        },
      ]);

      const res = await listUsers({ page: 1, limit: 10 });
      expect(res.data[0].hasDonorProfile).toBe(true);
      expect(res.data[1].hasDonorProfile).toBe(false);
      expect(res.meta.total).toBe(2);
    });
  });

  describe("getAdminStats", () => {
    it("aggregates stats correctly", async () => {
      (prisma.user.count as any)
        .mockResolvedValueOnce(50) // totalUsers
        .mockResolvedValueOnce(3); // blockedUsers
      (prisma.donorProfile.count as any)
        .mockResolvedValueOnce(20) // totalDonors
        .mockResolvedValueOnce(15); // availableEligibleDonors
      (prisma.donation.count as any).mockResolvedValueOnce(12); // donationsCompleted
      (prisma.bloodRequest.groupBy as any)
        .mockResolvedValueOnce([
          { status: "OPEN", _count: { status: 8 } },
          { status: "MATCHED", _count: { status: 4 } },
        ])
        .mockResolvedValueOnce([
          { district: "Dhaka", _count: { district: 5 } },
          { district: "Chittagong", _count: { district: 3 } },
        ]);
      (prisma.donorProfile.groupBy as any).mockResolvedValueOnce([
        { bloodGroup: "O_POSITIVE", _count: { bloodGroup: 10 } },
      ]);

      const stats = await getAdminStats();

      expect(stats.totalUsers).toBe(50);
      expect(stats.blockedUsers).toBe(3);
      expect(stats.totalDonors).toBe(20);
      expect(stats.availableEligibleDonors).toBe(15);
      expect(stats.donationsCompleted).toBe(12);
      expect(stats.requestsByStatus.OPEN).toBe(8);
      expect(stats.requestsByStatus.MATCHED).toBe(4);
      expect(stats.requestsByStatus.CANCELLED).toBe(0);
      expect(stats.donorsByBloodGroup["O+"]).toBe(10);
      expect(stats.topDistricts).toHaveLength(2);
      expect(stats.topDistricts[0]).toEqual({ district: "Dhaka", count: 5 });
    });
  });
});

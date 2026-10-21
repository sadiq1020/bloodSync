import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../config/prisma.js";
import {
  acceptDonation,
  completeDonation,
  cancelDonation,
} from "../modules/donation/donation.service.js";

// Mock prisma and transaction runner
vi.mock("../config/prisma.js", () => {
  const mockTx = {
    donation: {
      update: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
    },
    donorProfile: {
      update: vi.fn(),
    },
    bloodRequest: {
      update: vi.fn(),
    },
  };

  return {
    prisma: {
      donation: {
        findUnique: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
      },
      donorProfile: {
        findUnique: vi.fn(),
      },
      bloodRequest: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => {
        if (typeof cb === "function") {
          return cb(mockTx);
        }
        return Promise.all(cb);
      }),
      _mockTx: mockTx,
    },
  };
});

describe("Donation Status Lifecycle & Transitions", () => {
  const mockTx = (prisma as any)._mockTx;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("acceptDonation", () => {
    it("throws 403 if user is not the request owner", async () => {
      (prisma.donation.findUnique as any).mockResolvedValueOnce({
        id: "don-1",
        status: "PENDING",
        request: { requesterId: "owner-1", unitsNeeded: 1 },
      });

      await expect(acceptDonation("don-1", "stranger-99")).rejects.toThrow(
        "Only the request owner can accept this donation."
      );
    });

    it("throws 400 if donation is not PENDING", async () => {
      (prisma.donation.findUnique as any).mockResolvedValueOnce({
        id: "don-1",
        status: "ACCEPTED",
        request: { requesterId: "owner-1", unitsNeeded: 1 },
      });

      await expect(acceptDonation("don-1", "owner-1")).rejects.toThrow(
        "Cannot accept donation with status ACCEPTED"
      );
    });

    it("updates donation to ACCEPTED and marks request MATCHED when unitsNeeded reached", async () => {
      (prisma.donation.findUnique as any).mockResolvedValueOnce({
        id: "don-1",
        requestId: "req-1",
        status: "PENDING",
        request: { id: "req-1", requesterId: "owner-1", unitsNeeded: 2 },
      });

      mockTx.donation.update.mockResolvedValueOnce({
        id: "don-1",
        status: "ACCEPTED",
      });
      // 2 donations now accepted/completed
      mockTx.donation.count.mockResolvedValueOnce(2);
      mockTx.bloodRequest.update.mockResolvedValueOnce({
        id: "req-1",
        status: "MATCHED",
      });

      const result = await acceptDonation("don-1", "owner-1");

      expect(mockTx.donation.update).toHaveBeenCalledWith({
        where: { id: "don-1" },
        data: { status: "ACCEPTED" },
      });
      expect(mockTx.bloodRequest.update).toHaveBeenCalledWith({
        where: { id: "req-1" },
        data: { status: "MATCHED" },
      });
      expect(result.status).toBe("ACCEPTED");
    });
  });

  describe("completeDonation", () => {
    it("updates donor profile lastDonatedAt and sets request FULFILLED when units reached", async () => {
      (prisma.donation.findUnique as any).mockResolvedValueOnce({
        id: "don-1",
        requestId: "req-1",
        donorId: "donor-1",
        status: "ACCEPTED",
        request: { id: "req-1", requesterId: "owner-1", unitsNeeded: 1 },
      });

      mockTx.donation.update.mockResolvedValueOnce({
        id: "don-1",
        status: "COMPLETED",
      });
      mockTx.donorProfile.update.mockResolvedValueOnce({ id: "dp-1" });
      mockTx.donation.count.mockResolvedValueOnce(1); // 1 completed >= 1 needed
      mockTx.bloodRequest.update.mockResolvedValueOnce({
        id: "req-1",
        status: "FULFILLED",
      });
      mockTx.donation.updateMany.mockResolvedValueOnce({ count: 1 });

      const result = await completeDonation("don-1", "owner-1");

      expect(mockTx.donorProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "donor-1" },
        })
      );
      expect(mockTx.bloodRequest.update).toHaveBeenCalledWith({
        where: { id: "req-1" },
        data: { status: "FULFILLED" },
      });
      expect(mockTx.donation.updateMany).toHaveBeenCalledWith({
        where: {
          requestId: "req-1",
          status: "PENDING",
        },
        data: { status: "CANCELLED" },
      });
      expect(result.status).toBe("COMPLETED");
    });
  });

  describe("cancelDonation", () => {
    it("reverts MATCHED request back to OPEN if accepted count drops below unitsNeeded", async () => {
      (prisma.donation.findUnique as any).mockResolvedValueOnce({
        id: "don-1",
        requestId: "req-1",
        donorId: "donor-1",
        status: "ACCEPTED",
        request: {
          id: "req-1",
          requesterId: "owner-1",
          status: "MATCHED",
          unitsNeeded: 2,
        },
      });

      mockTx.donation.update.mockResolvedValueOnce({
        id: "don-1",
        status: "CANCELLED",
      });
      // remaining accepted/completed drops to 1 (< 2 needed)
      mockTx.donation.count.mockResolvedValueOnce(1);
      mockTx.bloodRequest.update.mockResolvedValueOnce({
        id: "req-1",
        status: "OPEN",
      });

      const result = await cancelDonation("don-1", "donor-1");

      expect(mockTx.donation.update).toHaveBeenCalledWith({
        where: { id: "don-1" },
        data: { status: "CANCELLED" },
      });
      expect(mockTx.bloodRequest.update).toHaveBeenCalledWith({
        where: { id: "req-1" },
        data: { status: "OPEN" },
      });
      expect(result.status).toBe("CANCELLED");
    });
  });
});

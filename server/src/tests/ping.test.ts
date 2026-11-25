import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { ping, checkHealth } from "../modules/health/health.controller.js";
import { prisma } from "../config/prisma.js";

describe("GET /api/ping and Health Handlers", () => {
  let mockReq: Partial<Request>;
  let mockRes: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      path: "/ping",
      method: "GET",
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("GET /api/ping", () => {
    it("returns HTTP 200 with { success: true } immediately", () => {
      ping(mockReq as Request, mockRes as unknown as Response);

      expect(mockRes.status).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it("does not execute any database query", () => {
      const querySpy = vi.spyOn(prisma, "$queryRawUnsafe");

      ping(mockReq as Request, mockRes as unknown as Response);

      expect(querySpy).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/health (remains as it is)", () => {
    it("executes database probe and returns 200 with connected status on success", async () => {
      vi.spyOn(prisma, "$queryRawUnsafe").mockResolvedValueOnce([{ "?column?": 1 }]);

      await checkHealth(mockReq as Request, mockRes as unknown as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            database: "connected",
            service: "bloodsync-backend",
          }),
        })
      );
    });

    it("catches database failure and returns HTTP 503 without leaking details", async () => {
      vi.spyOn(prisma, "$queryRawUnsafe").mockRejectedValueOnce(
        new Error("Connection refused to database")
      );

      await checkHealth(mockReq as Request, mockRes as unknown as Response);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Database unavailable",
      });
    });
  });
});


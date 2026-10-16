import { z } from "zod";

// Schema for health check query or payload validation
export const healthQuerySchema = z.object({}).optional();

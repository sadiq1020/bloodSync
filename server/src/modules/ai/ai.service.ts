import { openrouter } from "../../config/openrouter.js";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { BANGLADESH_DISTRICTS } from "../../constants/districts.js";
import { BLOOD_GROUPS, type BloodGroup } from "../../constants/bloodGroups.js";
import { getCompatibleDonorGroups } from "../../lib/bloodCompatibility.js";
import { ELIGIBILITY_DAYS } from "../../lib/eligibility.js";
import { MAX_TOKENS, SEND_RESPONSE_FORMAT, RETRY_SETTINGS } from "./ai.config.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "./ai.prompt.js";
import type { ParsedFields } from "./ai.validation.js";

// Helper map from blood group string to Prisma BloodGroup enum
const BLOOD_GROUP_TO_ENUM: Record<string, any> = {
  "A+": "A_POSITIVE",
  "A-": "A_NEGATIVE",
  "B+": "B_POSITIVE",
  "B-": "B_NEGATIVE",
  "AB+": "AB_POSITIVE",
  "AB-": "AB_NEGATIVE",
  "O+": "O_POSITIVE",
  "O-": "O_NEGATIVE",
};

// Extracts first Bangladesh mobile number from the text
export const extractContactPhone = (text: string): string | null => {
  const match = text.match(/(?:\+8801|01)[3-9]\d{8}/);
  return match ? match[0] : null;
};

// Normalizes district to canonical name from 64 Bangladesh districts (case-insensitive)
export const normalizeDistrict = (raw: unknown): string | null => {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const clean = raw.trim().toLowerCase();
  const found = BANGLADESH_DISTRICTS.find((d) => d.toLowerCase() === clean);
  return found ?? null;
};

// Normalizes blood group to standard group string
export const normalizeBloodGroup = (raw: unknown): BloodGroup | null => {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const clean = raw.trim().toUpperCase().replace(/\s+/g, "");

  // Common positive variations
  if (clean === "A+" || clean === "A+VE" || clean === "APOSITIVE" || clean === "APOS") return "A+";
  if (clean === "B+" || clean === "B+VE" || clean === "BPOSITIVE" || clean === "BPOS") return "B+";
  if (clean === "AB+" || clean === "AB+VE" || clean === "ABPOSITIVE" || clean === "ABPOS") return "AB+";
  if (clean === "O+" || clean === "O+VE" || clean === "OPOSITIVE" || clean === "OPOS") return "O+";

  // Common negative variations
  if (clean === "A-" || clean === "A-VE" || clean === "ANEGATIVE" || clean === "ANEG") return "A-";
  if (clean === "B-" || clean === "B-VE" || clean === "BNEGATIVE" || clean === "BNEG") return "B-";
  if (clean === "AB-" || clean === "AB-VE" || clean === "ABNEGATIVE" || clean === "ABNEG") return "AB-";
  if (clean === "O-" || clean === "O-VE" || clean === "ONEGATIVE" || clean === "ONEG") return "O-";

  return (BLOOD_GROUPS as readonly string[]).includes(clean) ? (clean as BloodGroup) : null;
};

// Helper to strip markdown code blocks from model output
export const stripMarkdownCodeFences = (text: string): string => {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
};

// Calls OpenRouter with retries for transient errors
const callOpenRouterWithRetry = async (prompt: string) => {
  let attempt = 0;
  const maxRetries = RETRY_SETTINGS.maxRetries;

  while (attempt <= maxRetries) {
    try {
      const response = await openrouter.chat.completions.create({
        model: env.OPENROUTER_MODEL,
        temperature: 0,
        max_tokens: MAX_TOKENS,
        ...(SEND_RESPONSE_FORMAT ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        // OpenRouter: minimize reasoning to return pure concise JSON
        reasoning: {
          effort: "low",
        },
      } as any);

      return response;
    } catch (err: any) {
      attempt++;

      // Check for timeout
      const isTimeout =
        err?.name === "APIConnectionTimeoutError" ||
        err?.code === "ETIMEDOUT" ||
        err?.status === 504 ||
        err?.status === 408;

      if (isTimeout) {
        throw new AppError("AI request timed out. Please fill the form manually.", 504);
      }

      // If we still have retries and error is 429 or 5xx, wait and retry
      const isRetryable = err?.status === 429 || (err?.status >= 500 && err?.status <= 503);
      if (attempt <= maxRetries && isRetryable) {
        const delay = Math.min(
          RETRY_SETTINGS.baseDelayMs * Math.pow(2, attempt - 1),
          RETRY_SETTINGS.maxDelayMs
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw new AppError("AI is unavailable right now. Please fill the form manually.", 502);
    }
  }

  throw new AppError("AI is unavailable right now. Please fill the form manually.", 502);
};

// Main service to parse raw blood request text into structured fields
export const parseBloodRequestText = async (text: string, currentUserId?: string) => {
  // 1. Extract contact phone directly via regex
  const contactPhone = extractContactPhone(text);

  // 2. Call OpenRouter AI
  const prompt = buildUserPrompt(text);
  const completion = await callOpenRouterWithRetry(prompt);

  const rawContent = completion.choices?.[0]?.message?.content;
  if (!rawContent || !rawContent.trim()) {
    throw new AppError("AI is unavailable right now. Please fill the form manually.", 502);
  }

  // 3. Strip code fences and parse JSON
  let parsedJson: any;
  try {
    const cleaned = stripMarkdownCodeFences(rawContent);
    parsedJson = JSON.parse(cleaned);
  } catch (_e) {
    throw new AppError("AI is unavailable right now. Please fill the form manually.", 502);
  }

  if (typeof parsedJson !== "object" || parsedJson === null) {
    throw new AppError("AI is unavailable right now. Please fill the form manually.", 502);
  }

  // 4. Sanitize extracted fields (gracefully falling back to null on invalid types)
  const patientName =
    typeof parsedJson.patientName === "string" && parsedJson.patientName.trim().length > 0
      ? parsedJson.patientName.trim()
      : null;

  const bloodGroup = normalizeBloodGroup(parsedJson.bloodGroup);
  const district = normalizeDistrict(parsedJson.district);

  const hospital =
    typeof parsedJson.hospital === "string" && parsedJson.hospital.trim().length > 0
      ? parsedJson.hospital.trim()
      : null;

  const area =
    typeof parsedJson.area === "string" && parsedJson.area.trim().length > 0
      ? parsedJson.area.trim()
      : null;

  let urgency: "NORMAL" | "URGENT" | "CRITICAL" = "NORMAL";
  if (
    parsedJson.urgency === "CRITICAL" ||
    parsedJson.urgency === "URGENT" ||
    parsedJson.urgency === "NORMAL"
  ) {
    urgency = parsedJson.urgency;
  }

  let unitsNeeded: number | null = null;
  if (typeof parsedJson.unitsNeeded === "number" && Number.isInteger(parsedJson.unitsNeeded)) {
    if (parsedJson.unitsNeeded >= 1 && parsedJson.unitsNeeded <= 10) {
      unitsNeeded = parsedJson.unitsNeeded;
    }
  }

  const fields: ParsedFields = {
    patientName,
    bloodGroup,
    unitsNeeded,
    hospital,
    district,
    area,
    urgency,
    contactPhone,
  };

  // 5. Compute missing required form fields
  const missingFields: string[] = [];
  if (!fields.bloodGroup) missingFields.push("bloodGroup");
  if (!fields.district) missingFields.push("district");
  if (!fields.hospital) missingFields.push("hospital");

  // 6. Compute matchingDonorsCount if bloodGroup and district are present
  let matchingDonorsCount: number | null = null;
  if (fields.bloodGroup && fields.district) {
    try {
      const compatibleGroups = getCompatibleDonorGroups(fields.bloodGroup);
      const compatibleEnums = compatibleGroups.map((g) => BLOOD_GROUP_TO_ENUM[g]);

      const eligibilityCutoff = new Date();
      eligibilityCutoff.setDate(eligibilityCutoff.getDate() - ELIGIBILITY_DAYS);

      matchingDonorsCount = await prisma.donorProfile.count({
        where: {
          ...(currentUserId ? { userId: { not: currentUserId } } : {}),
          isAvailable: true,
          district: fields.district,
          bloodGroup: { in: compatibleEnums },
          OR: [
            { lastDonatedAt: null },
            { lastDonatedAt: { lte: eligibilityCutoff } },
          ],
        },
      });
    } catch (_dbError) {
      matchingDonorsCount = null;
    }
  }

  return {
    fields,
    missingFields,
    matchingDonorsCount,
  };
};

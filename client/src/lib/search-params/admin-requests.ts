import {
  parseAsStringLiteral,
  parseAsInteger,
  createSearchParamsCache,
} from "nuqs/server";
import { BLOOD_GROUPS, type BloodGroup } from "@/lib/constants/bloodGroups";
import { BANGLADESH_DISTRICTS, type District } from "@/lib/constants/districts";
import type { RequestStatus } from "@/types/api";

export const ADMIN_REQUEST_STATUSES = [
  "OPEN",
  "MATCHED",
  "FULFILLED",
  "EXPIRED",
  "CANCELLED",
] as const;

export const adminRequestsParsers = {
  status: parseAsStringLiteral(ADMIN_REQUEST_STATUSES),
  district: parseAsStringLiteral(BANGLADESH_DISTRICTS),
  bloodGroup: parseAsStringLiteral(BLOOD_GROUPS),
  page: parseAsInteger.withDefault(1),
};

export const adminRequestsCache = createSearchParamsCache(adminRequestsParsers);
export type { RequestStatus, District, BloodGroup };

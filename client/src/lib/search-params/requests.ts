import { parseAsStringLiteral, parseAsInteger, createSearchParamsCache } from "nuqs/server";
import { BLOOD_GROUPS } from "@/lib/constants/bloodGroups";
import { BANGLADESH_DISTRICTS } from "@/lib/constants/districts";

const URGENCY_VALUES = ["NORMAL", "URGENT", "CRITICAL"] as const;
const REQUEST_STATUS_VALUES = [
  "OPEN",
  "MATCHED",
  "FULFILLED",
  "EXPIRED",
  "CANCELLED",
] as const;

/** Parsers shared between the server page and client list. Invalid URL values → null/default silently. */
export const requestsParsers = {
  district: parseAsStringLiteral([...BANGLADESH_DISTRICTS]),
  bloodGroup: parseAsStringLiteral([...BLOOD_GROUPS]),
  urgency: parseAsStringLiteral(URGENCY_VALUES),
  status: parseAsStringLiteral(REQUEST_STATUS_VALUES).withDefault("OPEN" as const),
  page: parseAsInteger.withDefault(1),
};

/** Use in server components to read validated params from `searchParams`. */
export const requestsCache = createSearchParamsCache(requestsParsers);

export type RequestsParams = {
  district: string | null;
  bloodGroup: string | null;
  urgency: string | null;
  status: "OPEN" | "MATCHED" | "FULFILLED" | "EXPIRED" | "CANCELLED";
  page: number;
};

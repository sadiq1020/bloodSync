import {
  parseAsStringLiteral,
  parseAsInteger,
  parseAsString,
  createSearchParamsCache,
} from "nuqs/server";
import { BLOOD_GROUPS } from "@/lib/constants/bloodGroups";
import { BANGLADESH_DISTRICTS } from "@/lib/constants/districts";

/** Parsers for the donor search page URL state. Invalid values → null silently. */
export const donorsParsers = {
  bloodGroup: parseAsStringLiteral([...BLOOD_GROUPS]),
  district: parseAsStringLiteral([...BANGLADESH_DISTRICTS]),
  /** Free-text area — trimmed, max 80 chars validated client-side before sending to API. */
  area: parseAsString,
  page: parseAsInteger.withDefault(1),
};

/** Use in server components to read validated params from `searchParams`. */
export const donorsCache = createSearchParamsCache(donorsParsers);

export type DonorsParams = {
  bloodGroup: string | null;
  district: string | null;
  area: string | null;
  page: number;
};

import {
  parseAsStringLiteral,
  parseAsInteger,
  createSearchParamsCache,
} from "nuqs/server";

export const MY_DONATION_STATUS_VALUES = [
  "PENDING",
  "ACCEPTED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type MyDonationStatus = (typeof MY_DONATION_STATUS_VALUES)[number];

export const myDonationsParsers = {
  status: parseAsStringLiteral(MY_DONATION_STATUS_VALUES),
  page: parseAsInteger.withDefault(1),
};

export const myDonationsCache = createSearchParamsCache(myDonationsParsers);

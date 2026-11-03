import {
  parseAsStringLiteral,
  parseAsInteger,
  createSearchParamsCache,
} from "nuqs/server";

export const MY_REQUEST_STATUS_VALUES = [
  "OPEN",
  "MATCHED",
  "FULFILLED",
  "EXPIRED",
  "CANCELLED",
] as const;

export type MyRequestStatus = (typeof MY_REQUEST_STATUS_VALUES)[number];

export const myRequestsParsers = {
  status: parseAsStringLiteral(MY_REQUEST_STATUS_VALUES),
  page: parseAsInteger.withDefault(1),
};

export const myRequestsCache = createSearchParamsCache(myRequestsParsers);

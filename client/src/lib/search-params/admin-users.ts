import {
  parseAsString,
  parseAsStringLiteral,
  parseAsInteger,
  createSearchParamsCache,
} from "nuqs/server";

export const ADMIN_USER_ROLES = ["USER", "ADMIN"] as const;
export type AdminUserRole = (typeof ADMIN_USER_ROLES)[number];

export const ADMIN_USER_STATUSES = ["ACTIVE", "BLOCKED"] as const;
export type AdminUserStatus = (typeof ADMIN_USER_STATUSES)[number];

export const adminUsersParsers = {
  search: parseAsString.withDefault(""),
  role: parseAsStringLiteral(ADMIN_USER_ROLES),
  status: parseAsStringLiteral(ADMIN_USER_STATUSES),
  page: parseAsInteger.withDefault(1),
};

export const adminUsersCache = createSearchParamsCache(adminUsersParsers);

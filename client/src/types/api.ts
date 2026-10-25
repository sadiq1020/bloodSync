// TypeScript types matching the server's Prisma models and API endpoint responses

export type Role = "USER" | "ADMIN";

export type BloodGroupEnum =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE";

export type Urgency = "NORMAL" | "URGENT" | "CRITICAL";

export type RequestStatus =
  "OPEN" | "MATCHED" | "FULFILLED" | "EXPIRED" | "CANCELLED";

export type DonationStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: Role;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DonorProfileSummary {
  id: string;
  bloodGroup: BloodGroupEnum;
  district: string;
  area: string;
  phone: string;
  isAvailable: boolean;
  lastDonatedAt: string | null;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isBlocked: boolean;
  image: string | null;
  createdAt: string;
  donorProfile: DonorProfileSummary | null;
}

export interface DonorProfile {
  id: string;
  userId: string;
  bloodGroup: BloodGroupEnum;
  district: string;
  area: string;
  phone: string;
  isAvailable: boolean;
  lastDonatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, "id" | "name" | "email" | "image">;
}

export interface MyDonorProfile extends DonorProfile {
  isEligible: boolean;
  nextEligibleDate: string | null;
}

export interface PublicDonor {
  bloodGroup: BloodGroupEnum;
  district: string;
  area: string;
  lastDonatedAt: string | null;
  user: {
    name: string;
  };
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  patientName: string;
  bloodGroup: BloodGroupEnum;
  unitsNeeded: number;
  hospital: string;
  district: string;
  area: string;
  urgency: Urgency;
  neededBy: string;
  contactPhone?: string | null;
  note: string | null;
  forSelf: boolean;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  requester?: Pick<User, "id" | "name" | "email" | "image">;
  _count?: {
    donations: number;
  };
  donations?: Donation[];
}

export interface Donation {
  id: string;
  requestId: string;
  donorId: string;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
  request?: BloodRequest;
  donor?: Pick<User, "id" | "name" | "email" | "image"> & {
    donorProfile?: Pick<
      DonorProfile,
      "bloodGroup" | "district" | "area" | "phone"
    > | null;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalDonors: number;
  totalRequests: number;
  totalDonations: number;
  activeRequests: number;
  completedDonations: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiFieldError[];
  stack?: string;
}

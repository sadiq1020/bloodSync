"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  ArrowClockwise,
  SpinnerGap,
  Trash,
  XCircle,
  Eye,
  Drop,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { adminRequestsParsers } from "@/lib/search-params/admin-requests";
import { BloodTypeBadge } from "@/components/brand/BloodTypeBadge";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { UrgencyBadge } from "@/components/brand/UrgencyBadge";
import { Pagination } from "@/components/features/shared/Pagination";
import { ListErrorBanner } from "@/components/features/shared/ListErrorBanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import { formatDate, formatRequestCode } from "@/lib/format";
import {
  ENUM_TO_BLOOD_GROUP_MAP,
  type BloodGroup,
} from "@/lib/constants/bloodGroups";
import type { AdminRequestItem, PaginatedResponse } from "@/types/api";

interface AdminRequestsListProps {
  initialData?: PaginatedResponse<AdminRequestItem>;
  initialParams: {
    status: string | null;
    district: string | null;
    bloodGroup: string | null;
    page: number;
  };
}

function buildQueryString(params: {
  status: string | null;
  district: string | null;
  bloodGroup: string | null;
  page: number;
}): string {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.district) qs.set("district", params.district);
  if (params.bloodGroup) qs.set("bloodGroup", params.bloodGroup);
  qs.set("page", String(params.page));
  qs.set("limit", "10");
  return qs.toString();
}

export function AdminRequestsList({
  initialData,
  initialParams,
}: AdminRequestsListProps) {
  const queryClient = useQueryClient();
  const [params, setParams] = useQueryStates(adminRequestsParsers, {
    shallow: true,
  });

  // Action Dialog state
  const [closeTarget, setCloseTarget] = React.useState<AdminRequestItem | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] =
    React.useState<AdminRequestItem | null>(null);
  const [deleteCodeInput, setDeleteCodeInput] = React.useState("");
  const [isActionPending, setIsActionPending] = React.useState(false);

  const queryParams = {
    status: params.status,
    district: params.district,
    bloodGroup: params.bloodGroup,
    page: params.page,
  };

  const isMatchesInitial =
    params.status === initialParams.status &&
    params.district === initialParams.district &&
    params.bloodGroup === initialParams.bloodGroup &&
    params.page === initialParams.page;

  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<PaginatedResponse<AdminRequestItem>>({
    queryKey: ["admin-requests", queryParams],
    queryFn: async () => {
      const qs = buildQueryString(queryParams);
      return apiFetch<PaginatedResponse<AdminRequestItem>>(
        `/api/admin/requests?${qs}`
      );
    },
    initialData: isMatchesInitial ? initialData : undefined,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  const requests = response?.data ?? [];
  const meta = response?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  // Handle Close Request
  const handleConfirmClose = async () => {
    if (!closeTarget) return;

    setIsActionPending(true);
    try {
      await apiFetch(`/api/admin/requests/${closeTarget.id}/close`, {
        method: "PATCH",
      });

      toast.success(
        `Request ${formatRequestCode(closeTarget.id)} has been closed.`
      );
      await queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      setCloseTarget(null);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to close request.");
      }
    } finally {
      setIsActionPending(false);
    }
  };

  // Handle Hard Delete Request
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsActionPending(true);
    try {
      await apiFetch(`/api/admin/requests/${deleteTarget.id}`, {
        method: "DELETE",
      });

      toast.success(
        `Request ${formatRequestCode(deleteTarget.id)} has been deleted.`
      );
      await queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      setDeleteTarget(null);
      setDeleteCodeInput("");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete request.");
      }
    } finally {
      setIsActionPending(false);
    }
  };

  const expectedCode = deleteTarget
    ? formatRequestCode(deleteTarget.id)
    : "";
  const isDeleteMatch =
    deleteCodeInput.trim().toUpperCase() === expectedCode.toUpperCase();

  return (
    <div className="space-y-4">
      {/* Meta bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <p className="font-mono text-xs text-fg-muted">
          {isLoading ? (
            <span className="inline-block h-3.5 w-28 animate-pulse rounded bg-surface-2" />
          ) : total === 0 ? (
            "0 requests found"
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold text-fg">
                {(params.page - 1) * 10 + 1}
              </span>
              –
              <span className="font-semibold text-fg">
                {Math.min(params.page * 10, total)}
              </span>{" "}
              of <span className="font-semibold text-fg">{total}</span> requests
            </>
          )}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh requests list"
          title="Refresh requests list"
          className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-line bg-surface px-2.5 font-sans text-xs font-medium text-fg-muted transition-colors hover:border-line-strong hover:bg-surface-2 hover:text-fg disabled:opacity-50"
        >
          {isFetching ? (
            <SpinnerGap
              className="h-3.5 w-3.5 animate-spin text-blood"
              aria-hidden="true"
            />
          ) : (
            <ArrowClockwise className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>Refresh</span>
        </button>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <ListErrorBanner
          message="Failed to load requests. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      )}

      {/* Empty state */}
      {!isLoading && !error && requests.length === 0 && (
        <div className="rounded-[6px] border border-dashed border-line bg-surface/50 p-8 text-center sm:p-12">
          <div className="mx-auto max-w-sm space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-fg-muted">
              <Drop className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-sans text-sm font-semibold text-fg">
              No requests found
            </h3>
            <p className="font-sans text-xs text-fg-muted">
              No requests match your current filters. Try changing or clearing
              the status, district, or blood group options.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setParams({
                    status: null,
                    district: null,
                    bloodGroup: null,
                    page: 1,
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-line bg-surface px-3 py-1.5 font-sans text-xs font-medium text-fg hover:border-line-strong hover:bg-surface-2"
              >
                Reset filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div
          className="space-y-3"
          aria-busy="true"
          aria-label="Loading requests"
        >
          <div className="h-14 animate-pulse rounded-[4px] bg-surface-2" />
          <div className="h-14 animate-pulse rounded-[4px] bg-surface-2" />
          <div className="h-14 animate-pulse rounded-[4px] bg-surface-2" />
          <div className="h-14 animate-pulse rounded-[4px] bg-surface-2" />
          <div className="h-14 animate-pulse rounded-[4px] bg-surface-2" />
        </div>
      )}

      {/* DESKTOP TABLE (lg and up) */}
      {!isLoading && requests.length > 0 && (
        <div className="hidden lg:block overflow-hidden rounded-[6px] border border-line bg-surface">
          <table className="w-full text-left font-sans text-xs">
            <caption className="sr-only">Platform blood requests list</caption>
            <thead className="border-b border-line bg-surface-2/60 font-mono text-[11px] font-semibold text-fg-muted uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-3.5 py-3">
                  Request
                </th>
                <th scope="col" className="px-3.5 py-3">
                  Hospital & District
                </th>
                <th scope="col" className="px-3.5 py-3">
                  Requester
                </th>
                <th scope="col" className="px-3.5 py-3">
                  Urgency
                </th>
                <th scope="col" className="px-3.5 py-3">
                  Status
                </th>
                <th scope="col" className="px-3.5 py-3">
                  Donations
                </th>
                <th scope="col" className="px-3.5 py-3">
                  Needed By
                </th>
                <th scope="col" className="px-3.5 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {requests.map((req) => {
                const code = formatRequestCode(req.id);
                const displayBloodGroup = (ENUM_TO_BLOOD_GROUP_MAP[
                  req.bloodGroup
                ] || req.bloodGroup) as BloodGroup;
                const canClose =
                  req.status === "OPEN" || req.status === "MATCHED";

                return (
                  <tr
                    key={req.id}
                    className="transition-colors hover:bg-surface-2/40"
                  >
                    {/* 1. Request Code & Blood Badge */}
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2">
                        <BloodTypeBadge
                          bloodGroup={displayBloodGroup}
                          size="sm"
                        />
                        <span className="font-mono text-xs font-semibold text-fg">
                          {code}
                        </span>
                      </div>
                    </td>

                    {/* 2. Hospital & District */}
                    <td className="px-3.5 py-3">
                      <div className="space-y-0.5">
                        <p className="font-medium text-fg truncate max-w-[160px]">
                          {req.hospital}
                        </p>
                        <p className="font-mono text-[11px] text-fg-muted">
                          {req.district}
                          {req.area ? `, ${req.area}` : ""}
                        </p>
                      </div>
                    </td>

                    {/* 3. Requester */}
                    <td className="px-3.5 py-3">
                      <div className="space-y-0.5">
                        <p className="font-medium text-fg">
                          {req.requester.name}
                        </p>
                        <p className="font-mono text-[11px] text-fg-muted truncate max-w-[150px]">
                          {req.requester.email}
                        </p>
                      </div>
                    </td>

                    {/* 4. Urgency */}
                    <td className="px-3.5 py-3">
                      <UrgencyBadge urgency={req.urgency} />
                    </td>

                    {/* 5. Status */}
                    <td className="px-3.5 py-3">
                      <StatusBadge status={req.status} />
                    </td>

                    {/* 6. Donations counts */}
                    <td className="px-3.5 py-3 font-mono text-[11px] text-fg-dim whitespace-nowrap">
                      <span>P: {req.donationCounts.PENDING}</span> ·{" "}
                      <span className="text-plasma">
                        A: {req.donationCounts.ACCEPTED}
                      </span>{" "}
                      ·{" "}
                      <span className="text-sage">
                        D: {req.donationCounts.COMPLETED}
                      </span>
                    </td>

                    {/* 7. Needed By */}
                    <td className="px-3.5 py-3 font-mono text-[11px] text-fg-muted whitespace-nowrap">
                      {formatDate(req.neededBy)}
                    </td>

                    {/* 8. Actions */}
                    <td className="px-3.5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/requests/${req.id}`}
                          className="inline-flex h-7 items-center gap-1 rounded-[3px] border border-line bg-surface-2 px-2 font-sans text-xs font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                          aria-label={`View ${code}`}
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </Link>

                        {canClose && (
                          <button
                            type="button"
                            onClick={() => setCloseTarget(req)}
                            className="inline-flex h-7 items-center gap-1 rounded-[3px] border border-plasma/30 bg-plasma/10 px-2 font-sans text-xs font-medium text-plasma transition-colors hover:border-plasma hover:bg-plasma/20"
                            aria-label={`Close ${code}`}
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Close</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(req);
                            setDeleteCodeInput("");
                          }}
                          className="inline-flex h-7 items-center gap-1 rounded-[3px] border border-blood/40 bg-blood-deep/20 px-2 font-sans text-xs font-medium text-blood-light transition-colors hover:border-blood hover:bg-blood/20"
                          aria-label={`Delete ${code}`}
                        >
                          <Trash className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE STACKED CARDS (below lg) */}
      {!isLoading && requests.length > 0 && (
        <div className="space-y-3 lg:hidden">
          {requests.map((req) => {
            const code = formatRequestCode(req.id);
            const displayBloodGroup = (ENUM_TO_BLOOD_GROUP_MAP[
              req.bloodGroup
            ] || req.bloodGroup) as BloodGroup;
            const canClose =
              req.status === "OPEN" || req.status === "MATCHED";

            return (
              <div
                key={req.id}
                className="rounded-[6px] border border-line bg-surface p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BloodTypeBadge
                      bloodGroup={displayBloodGroup}
                      size="sm"
                    />
                    <div>
                      <span className="font-mono text-xs font-semibold text-fg">
                        {code}
                      </span>
                      <p className="font-sans text-xs text-fg font-medium">
                        {req.hospital}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-y border-line/60 py-2.5 font-mono">
                  <div>
                    <span className="text-fg-dim block text-[10px]">
                      DISTRICT
                    </span>
                    <span className="text-fg font-sans text-xs">
                      {req.district}
                      {req.area ? `, ${req.area}` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-fg-dim block text-[10px]">
                      NEEDED BY
                    </span>
                    <span className="text-fg">{formatDate(req.neededBy)}</span>
                  </div>
                  <div>
                    <span className="text-fg-dim block text-[10px]">
                      REQUESTER
                    </span>
                    <span className="text-fg font-sans text-xs truncate block">
                      {req.requester.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-fg-dim block text-[10px]">
                      DONATIONS
                    </span>
                    <span className="text-fg-muted">
                      P: {req.donationCounts.PENDING} · A:{" "}
                      {req.donationCounts.ACCEPTED} · D:{" "}
                      {req.donationCounts.COMPLETED}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Link
                    href={`/requests/${req.id}`}
                    className="inline-flex h-8 items-center gap-1 rounded-[3px] border border-line bg-surface-2 px-3 font-sans text-xs font-medium text-fg-muted hover:text-fg"
                    aria-label={`View ${code}`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </Link>

                  {canClose && (
                    <button
                      type="button"
                      onClick={() => setCloseTarget(req)}
                      className="inline-flex h-8 items-center gap-1 rounded-[3px] border border-plasma/30 bg-plasma/10 px-3 font-sans text-xs font-medium text-plasma"
                      aria-label={`Close ${code}`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Close</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget(req);
                      setDeleteCodeInput("");
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-[3px] border border-blood/40 bg-blood-deep/20 px-3 font-sans text-xs font-medium text-blood-light"
                    aria-label={`Delete ${code}`}
                  >
                    <Trash className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            page={params.page}
            totalPages={totalPages}
            onPageChange={(nextPage) => {
              setParams({ page: nextPage });
            }}
            ariaLabel="Admin requests pagination"
          />
        </div>
      )}

      {/* CLOSE CONFIRMATION DIALOG */}
      <Dialog
        open={closeTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isActionPending) {
            setCloseTarget(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold text-fg">
              Close request {closeTarget ? formatRequestCode(closeTarget.id) : ""}?
            </DialogTitle>
            <DialogDescription className="font-sans text-xs leading-relaxed text-fg-muted pt-2">
              Close this request? It becomes Cancelled and all pending and
              accepted donors are released.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-2">
            <DialogClose
              disabled={isActionPending}
              className="rounded-[4px] border border-line bg-surface px-4 py-2 font-sans text-xs font-medium text-fg-muted hover:text-fg disabled:opacity-50"
            >
              Cancel
            </DialogClose>
            <button
              type="button"
              disabled={isActionPending}
              onClick={handleConfirmClose}
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-blood px-4 py-2 font-sans text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blood/90 disabled:opacity-50"
            >
              {isActionPending ? (
                <>
                  <SpinnerGap className="h-3.5 w-3.5 animate-spin" />
                  <span>Closing...</span>
                </>
              ) : (
                <span>Close request</span>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HARD DELETE CONFIRMATION DIALOG (Requires typing code) */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isActionPending) {
            setDeleteTarget(null);
            setDeleteCodeInput("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold text-fg">
              Permanently delete {expectedCode}?
            </DialogTitle>
            <DialogDescription className="font-sans text-xs leading-relaxed text-fg-muted pt-2">
              This action is permanent and completely deletes the request along
              with all donor responses and volunteer records.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label
              htmlFor="confirm-delete-code"
              className="font-mono text-xs text-fg-muted"
            >
              Please type <strong className="text-fg">{expectedCode}</strong> to
              confirm deletion:
            </label>
            <input
              id="confirm-delete-code"
              type="text"
              value={deleteCodeInput}
              onChange={(e) => setDeleteCodeInput(e.target.value)}
              placeholder={expectedCode}
              disabled={isActionPending}
              className="h-9 w-full rounded-[4px] border border-line bg-surface-2 px-3 font-mono text-xs text-fg placeholder:text-fg-dim focus:border-blood focus:outline-none focus:ring-1 focus:ring-blood"
              autoComplete="off"
            />
          </div>

          <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-2">
            <DialogClose
              disabled={isActionPending}
              className="rounded-[4px] border border-line bg-surface px-4 py-2 font-sans text-xs font-medium text-fg-muted hover:text-fg disabled:opacity-50"
            >
              Cancel
            </DialogClose>
            <button
              type="button"
              disabled={!isDeleteMatch || isActionPending}
              onClick={handleConfirmDelete}
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-blood px-4 py-2 font-sans text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blood/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isActionPending ? (
                <>
                  <SpinnerGap className="h-3.5 w-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete request</span>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

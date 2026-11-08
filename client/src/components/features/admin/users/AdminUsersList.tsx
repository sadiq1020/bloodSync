"use client";

import * as React from "react";
import { useQueryStates } from "nuqs";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  ArrowClockwise,
  SpinnerGap,
  Prohibit,
  CheckCircle,
  Users,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { adminUsersParsers } from "@/lib/search-params/admin-users";
import { useDebouncedValue } from "@/hooks";
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
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminUserItem, PaginatedResponse } from "@/types/api";

interface AdminUsersListProps {
  initialData?: PaginatedResponse<AdminUserItem>;
  initialParams: {
    search: string;
    role: string | null;
    status: string | null;
    page: number;
  };
  currentAdminId: string;
}

function buildQueryString(params: {
  search: string;
  role: string | null;
  status: string | null;
  page: number;
}): string {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.role) qs.set("role", params.role);
  if (params.status === "ACTIVE") qs.set("isBlocked", "false");
  if (params.status === "BLOCKED") qs.set("isBlocked", "true");
  qs.set("page", String(params.page));
  qs.set("limit", "10");
  return qs.toString();
}

export function AdminUsersList({
  initialData,
  initialParams,
  currentAdminId,
}: AdminUsersListProps) {
  const queryClient = useQueryClient();
  const [params, setParams] = useQueryStates(adminUsersParsers, {
    shallow: true,
  });

  // Dialog state for block/unblock actions
  const [targetUser, setTargetUser] = React.useState<AdminUserItem | null>(null);
  const [dialogMode, setDialogMode] = React.useState<"block" | "unblock" | null>(
    null
  );
  const [isActionPending, setIsActionPending] = React.useState(false);

  const debouncedSearch = useDebouncedValue(params.search, 400);

  const queryParams = {
    search: debouncedSearch,
    role: params.role,
    status: params.status,
    page: params.page,
  };

  const isMatchesInitial =
    debouncedSearch === initialParams.search &&
    params.role === initialParams.role &&
    params.status === initialParams.status &&
    params.page === initialParams.page;

  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<PaginatedResponse<AdminUserItem>>({
    queryKey: ["admin-users", queryParams],
    queryFn: async () => {
      const qs = buildQueryString(queryParams);
      return apiFetch<PaginatedResponse<AdminUserItem>>(
        `/api/admin/users?${qs}`
      );
    },
    initialData: isMatchesInitial ? initialData : undefined,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

  const users = response?.data ?? [];
  const meta = response?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  const handleConfirmAction = async () => {
    if (!targetUser || !dialogMode) return;

    setIsActionPending(true);
    const newBlockedState = dialogMode === "block";

    try {
      await apiFetch(`/api/admin/users/${targetUser.id}/block`, {
        method: "PATCH",
        body: { isBlocked: newBlockedState },
      });

      toast.success(
        newBlockedState
          ? `${targetUser.name} blocked.`
          : `${targetUser.name} unblocked.`
      );

      // Invalidate the users list query (server-state pattern)
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDialogMode(null);
      setTargetUser(null);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update user status.");
      }
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Meta bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <p className="font-mono text-xs text-fg-muted">
          {isLoading ? (
            <span className="inline-block h-3.5 w-28 animate-pulse rounded bg-surface-2" />
          ) : total === 0 ? (
            "0 users found"
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
              of <span className="font-semibold text-fg">{total}</span> users
            </>
          )}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh users list"
          title="Refresh users list"
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
          message="Failed to load users. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      )}

      {/* Empty state */}
      {!isLoading && !error && users.length === 0 && (
        <div className="rounded-[6px] border border-dashed border-line bg-surface/50 p-8 text-center sm:p-12">
          <div className="mx-auto max-w-sm space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-fg-muted">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-sans text-sm font-semibold text-fg">
              No users found
            </h3>
            <p className="font-sans text-xs text-fg-muted">
              No users match your current filter settings. Try adjusting your
              search term or role and status criteria.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setParams({
                    search: null,
                    role: null,
                    status: null,
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
        <div className="space-y-3" aria-busy="true" aria-label="Loading users">
          <div className="h-12 animate-pulse rounded-[4px] bg-surface-2" />
          <div className="h-12 animate-pulse rounded-[4px] bg-surface-2" />
          <div className="h-12 animate-pulse rounded-[4px] bg-surface-2" />
          <div className="h-12 animate-pulse rounded-[4px] bg-surface-2" />
          <div className="h-12 animate-pulse rounded-[4px] bg-surface-2" />
        </div>
      )}

      {/* DESKTOP TABLE (lg and up) */}
      {!isLoading && users.length > 0 && (
        <div className="hidden lg:block overflow-hidden rounded-[6px] border border-line bg-surface">
          <table className="w-full text-left font-sans text-xs">
            <caption className="sr-only">Platform registered users</caption>
            <thead className="border-b border-line bg-surface-2/60 font-mono text-[11px] font-semibold text-fg-muted uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Name
                </th>
                <th scope="col" className="px-4 py-3">
                  Email
                </th>
                <th scope="col" className="px-4 py-3">
                  Role
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3">
                  Donor
                </th>
                <th scope="col" className="px-4 py-3">
                  Joined
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => {
                const isAdmin = user.role === "ADMIN";
                const isSelf = user.id === currentAdminId;
                const cannotBlock = isAdmin || isSelf;

                return (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-surface-2/40"
                  >
                    <td className="px-4 py-3 font-medium text-fg">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-fg-muted">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <span className="inline-flex rounded-[3px] bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-semibold text-fg uppercase tracking-wider border border-line">
                          ADMIN
                        </span>
                      ) : (
                        <span className="font-mono text-fg-dim">USER</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1 rounded-[3px] bg-blood-deep/40 px-2 py-0.5 font-mono text-[10px] font-bold text-blood-light uppercase tracking-wider">
                          <Prohibit className="h-3 w-3" weight="bold" />
                          <span>BLOCKED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-[3px] bg-sage/20 px-2 py-0.5 font-mono text-[10px] font-bold text-sage uppercase tracking-wider">
                          <CheckCircle className="h-3 w-3" weight="fill" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.hasDonorProfile ? (
                        <span className="inline-flex rounded-[3px] bg-blood/15 px-2 py-0.5 font-mono text-[10px] font-bold text-blood uppercase tracking-wider">
                          DONOR
                        </span>
                      ) : (
                        <span className="font-mono text-fg-dim">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-fg-muted">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.isBlocked ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTargetUser(user);
                            setDialogMode("unblock");
                          }}
                          className="inline-flex h-7 items-center justify-center rounded-[3px] border border-line bg-surface-2 px-2.5 font-sans text-xs font-medium text-fg transition-colors hover:border-line-strong hover:bg-surface-3"
                          aria-label={`Unblock ${user.name}`}
                        >
                          Unblock
                        </button>
                      ) : (
                        <div className="inline-block relative">
                          <button
                            type="button"
                            disabled={cannotBlock}
                            onClick={() => {
                              setTargetUser(user);
                              setDialogMode("block");
                            }}
                            title={
                              cannotBlock ? "Admins cannot be blocked" : undefined
                            }
                            aria-describedby={
                              cannotBlock
                                ? `admin-hint-${user.id}`
                                : undefined
                            }
                            className={cn(
                              "inline-flex h-7 items-center justify-center rounded-[3px] px-2.5 font-sans text-xs font-medium transition-colors",
                              cannotBlock
                                ? "cursor-not-allowed border border-line bg-surface-2 text-fg-dim opacity-50"
                                : "border border-blood/40 bg-blood-deep/20 text-blood-light hover:border-blood hover:bg-blood/20"
                            )}
                            aria-label={`Block ${user.name}`}
                          >
                            Block
                          </button>
                          {cannotBlock && (
                            <span
                              id={`admin-hint-${user.id}`}
                              className="sr-only"
                            >
                              Admins cannot be blocked
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE STACKED CARDS (below lg) */}
      {!isLoading && users.length > 0 && (
        <div className="space-y-3 lg:hidden">
          {users.map((user) => {
            const isAdmin = user.role === "ADMIN";
            const isSelf = user.id === currentAdminId;
            const cannotBlock = isAdmin || isSelf;

            return (
              <div
                key={user.id}
                className="rounded-[6px] border border-line bg-surface p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-sans text-sm font-semibold text-fg">
                      {user.name}
                    </h4>
                    <p className="font-mono text-xs text-fg-muted break-all">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {isAdmin && (
                      <span className="rounded-[3px] bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-fg uppercase border border-line">
                        ADMIN
                      </span>
                    )}
                    {user.hasDonorProfile && (
                      <span className="rounded-[3px] bg-blood/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blood uppercase">
                        DONOR
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-line/60 pt-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-mono text-[10px] text-fg-dim">STATUS</p>
                    {user.isBlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-[3px] bg-blood-deep/40 px-2 py-0.5 font-mono text-[10px] font-bold text-blood-light uppercase">
                        <Prohibit className="h-3 w-3" weight="bold" />
                        BLOCKED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-[3px] bg-sage/20 px-2 py-0.5 font-mono text-[10px] font-bold text-sage uppercase">
                        <CheckCircle className="h-3 w-3" weight="fill" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div>
                    {user.isBlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          setTargetUser(user);
                          setDialogMode("unblock");
                        }}
                        className="inline-flex h-8 items-center justify-center rounded-[3px] border border-line bg-surface-2 px-3 font-sans text-xs font-medium text-fg"
                        aria-label={`Unblock ${user.name}`}
                      >
                        Unblock
                      </button>
                    ) : (
                      <div className="inline-block relative">
                        <button
                          type="button"
                          disabled={cannotBlock}
                          onClick={() => {
                            setTargetUser(user);
                            setDialogMode("block");
                          }}
                          title={
                            cannotBlock ? "Admins cannot be blocked" : undefined
                          }
                          aria-describedby={
                            cannotBlock ? `mob-admin-hint-${user.id}` : undefined
                          }
                          className={cn(
                            "inline-flex h-8 items-center justify-center rounded-[3px] px-3 font-sans text-xs font-medium",
                            cannotBlock
                              ? "cursor-not-allowed border border-line bg-surface-2 text-fg-dim opacity-50"
                              : "border border-blood/40 bg-blood-deep/20 text-blood-light"
                          )}
                          aria-label={`Block ${user.name}`}
                        >
                          Block
                        </button>
                        {cannotBlock && (
                          <span
                            id={`mob-admin-hint-${user.id}`}
                            className="sr-only"
                          >
                            Admins cannot be blocked
                          </span>
                        )}
                      </div>
                    )}
                  </div>
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
            ariaLabel="Admin users pagination"
          />
        </div>
      )}

      {/* BLOCK CONFIRMATION DIALOG (Alert Dialog) */}
      <Dialog
        open={dialogMode === "block"}
        onOpenChange={(open) => {
          if (!open && !isActionPending) {
            setDialogMode(null);
            setTargetUser(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold text-fg">
              Block {targetUser?.name}?
            </DialogTitle>
            <DialogDescription className="font-sans text-xs leading-relaxed text-fg-muted pt-2">
              They will be signed out immediately and cannot use BloodSync until
              unblocked.
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
              onClick={handleConfirmAction}
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-blood px-4 py-2 font-sans text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blood/90 disabled:opacity-50"
            >
              {isActionPending ? (
                <>
                  <SpinnerGap className="h-3.5 w-3.5 animate-spin" />
                  <span>Blocking...</span>
                </>
              ) : (
                <span>Block user</span>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UNBLOCK CONFIRMATION DIALOG */}
      <Dialog
        open={dialogMode === "unblock"}
        onOpenChange={(open) => {
          if (!open && !isActionPending) {
            setDialogMode(null);
            setTargetUser(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold text-fg">
              Unblock {targetUser?.name}?
            </DialogTitle>
            <DialogDescription className="font-sans text-xs leading-relaxed text-fg-muted pt-2">
              They will be able to sign in and volunteer or create blood requests
              again.
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
              onClick={handleConfirmAction}
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-blood px-4 py-2 font-sans text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blood/90 disabled:opacity-50"
            >
              {isActionPending ? (
                <>
                  <SpinnerGap className="h-3.5 w-3.5 animate-spin" />
                  <span>Unblocking...</span>
                </>
              ) : (
                <span>Unblock user</span>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/layout/PageHeader";
import { DonorFilters } from "@/components/features/donors/DonorFilters";
import { DonorList } from "@/components/features/donors/DonorList";
import { donorsCache } from "@/lib/search-params/donors";
import { serverFetch } from "@/lib/api/server";
import type { PaginatedResponse, PublicDonor } from "@/types/api";

export const metadata: Metadata = {
  title: "Find Donors — BloodSync",
  description:
    "Search eligible blood donors by blood group, district and area across Bangladesh.",
};


interface DonorsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DonorsSearchPage({ searchParams }: DonorsPageProps) {
  const parsedParams = await donorsCache.parse(await searchParams);

  const qs = new URLSearchParams();
  if (parsedParams.bloodGroup) qs.set("bloodGroup", parsedParams.bloodGroup);
  if (parsedParams.district) qs.set("district", parsedParams.district);
  if (parsedParams.area) qs.set("area", parsedParams.area);
  qs.set("page", String(parsedParams.page));

  const initialData = await serverFetch<PaginatedResponse<PublicDonor>>(
    `/api/donors/search?${qs.toString()}`
  ).catch(() => undefined);

  return (
    <>
      <PageHeader
        eyebrow="DONORS"
        title="Find donors"
        description="Search eligible donors by blood group and area."
      />

      {/* Privacy & compatibility note */}
      <div className="flex items-start gap-3 rounded-[6px] border border-line bg-surface-2 px-4 py-3 mb-2">
        <Info
          className="mt-0.5 size-4 shrink-0 text-fg-dim"
          weight="duotone"
          aria-hidden="true"
        />
        <p className="font-sans text-sm text-fg-muted leading-relaxed">
          Phone numbers are not shown here. To contact donors,{" "}
          <Link
            href="/requests/new"
            className="font-medium text-blood underline-offset-2 hover:underline"
          >
            post a blood request
          </Link>{" "}
          and you will see the donors who match it. This search matches the{" "}
          <strong className="font-medium text-fg">exact blood group</strong> —
          the ranked list on a request also includes compatible groups.
        </p>
      </div>

      <div className="space-y-4">
        <DonorFilters />
        <DonorList
          initialData={initialData}
          initialParams={parsedParams}
        />
      </div>
    </>
  );
}

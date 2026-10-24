"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  DotsThreeVerticalIcon,
  SparkleIcon,
  BellIcon,
} from "@phosphor-icons/react";

export default function DesignFoundationPage() {
  const [selectedBloodGroup, setSelectedBloodGroup] = React.useState("A+");

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Page Header */}
      <header className="border-line border-b pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-blood-deep/40 text-blood flex size-7 items-center justify-center rounded-[4px]">
                <DropIcon size={18} weight="fill" />
              </span>
              <h1 className="font-display text-fg text-3xl font-semibold tracking-tight">
                BloodSync Design Foundation
              </h1>
            </div>
            <p className="text-fg-muted mt-2 text-sm">
              Warm &ldquo;wine and ink&rdquo; dark-only theme. Hairline borders,
              solid blood primary, custom typography, and zero generic AI bloat.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">Prompt F2 Review</Badge>
            <Badge variant="outline">Dark-Only</Badge>
          </div>
        </div>
      </header>

      {/* 1. Color Palette Tokens */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-fg text-xl font-medium">
            1. Color Palette Tokens
          </h2>
          <span className="text-fg-dim font-mono text-xs">
            Tailwind v4 @theme
          </span>
        </div>

        {/* Backgrounds & Surfaces */}
        <div className="mb-6">
          <h3 className="text-fg-dim mb-3 font-mono text-xs tracking-wider uppercase">
            Backgrounds & Surfaces
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="border-line bg-bg rounded-[6px] border p-4">
              <div className="border-line bg-bg h-10 w-full rounded-[4px] border" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-fg text-xs font-medium">bg</span>
                <span className="text-fg-dim font-mono text-[11px]">
                  #130B0D
                </span>
              </div>
              <p className="text-fg-muted mt-1 text-[11px]">Primary canvas</p>
            </div>

            <div className="border-line bg-surface rounded-[6px] border p-4">
              <div className="border-line bg-surface h-10 w-full rounded-[4px] border" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-fg text-xs font-medium">surface</span>
                <span className="text-fg-dim font-mono text-[11px]">
                  #1B1114
                </span>
              </div>
              <p className="text-fg-muted mt-1 text-[11px]">
                Cards, dialogs, popovers
              </p>
            </div>

            <div className="border-line bg-surface-2 rounded-[6px] border p-4">
              <div className="border-line bg-surface-2 h-10 w-full rounded-[4px] border" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-fg text-xs font-medium">surface-2</span>
                <span className="text-fg-dim font-mono text-[11px]">
                  #241619
                </span>
              </div>
              <p className="text-fg-muted mt-1 text-[11px]">
                Secondary active states
              </p>
            </div>

            <div className="border-line bg-surface-dark rounded-[6px] border p-4">
              <div className="border-line bg-surface-dark h-10 w-full rounded-[4px] border" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-fg text-xs font-medium">
                  surface-dark
                </span>
                <span className="text-fg-dim font-mono text-[11px]">
                  #0D0709
                </span>
              </div>
              <p className="text-fg-muted mt-1 text-[11px]">
                Inputs & recessed wells
              </p>
            </div>
          </div>
        </div>

        {/* Brand & Accent Tokens */}
        <div className="mb-6">
          <h3 className="text-fg-dim mb-3 font-mono text-xs tracking-wider uppercase">
            Blood & Accent Tokens
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="border-line bg-surface rounded-[6px] border p-4">
              <div className="bg-blood h-10 w-full rounded-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-fg text-xs font-medium">blood</span>
                <span className="text-fg-dim font-mono text-[11px]">
                  #D92D43
                </span>
              </div>
              <p className="text-fg-muted mt-1 text-[11px]">
                Primary action solid
              </p>
            </div>

            <div className="border-line bg-surface rounded-[6px] border p-4">
              <div className="bg-blood-hover h-10 w-full rounded-[4px]" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-fg text-xs font-medium">blood-hover</span>
                <span className="text-fg-dim font-mono text-[11px]">
                  #EE4258
                </span>
              </div>
              <p className="text-fg-muted mt-1 text-[11px]">Hover state</p>
            </div>

            <div className="border-line bg-surface rounded-[6px] border p-4">
              <div className="bg-blood-deep h-10 w-full rounded-[4px]" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-fg text-xs font-medium">blood-deep</span>
                <span className="text-fg-dim font-mono text-[11px]">
                  #7A1523
                </span>
              </div>
              <p className="text-fg-muted mt-1 text-[11px]">
                Deep wine / borders
              </p>
            </div>

            <div className="border-line bg-surface rounded-[6px] border p-4">
              <div className="h-10 w-full rounded-[4px] bg-[#FF6B81]" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-fg text-xs font-medium">blood-text</span>
                <span className="text-fg-dim font-mono text-[11px]">
                  #FF6B81
                </span>
              </div>
              <p className="text-sage mt-1 text-[11px]">
                WCAG AA 5.6:1 (adjusted)
              </p>
            </div>

            <div className="border-line bg-surface rounded-[6px] border p-4">
              <div className="flex h-10 w-full gap-2">
                <div className="bg-plasma h-full flex-1 rounded-[4px]" />
                <div className="bg-sage h-full flex-1 rounded-[4px]" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-fg text-xs font-medium">
                  plasma / sage
                </span>
                <span className="text-fg-dim font-mono text-[11px]">
                  #E9B872 / #7FB89A
                </span>
              </div>
              <p className="text-fg-muted mt-1 text-[11px]">
                Status highlights
              </p>
            </div>
          </div>
        </div>

        {/* Lines & Text Tokens */}
        <div className="border-line bg-surface rounded-[6px] border p-4">
          <h3 className="text-fg-dim mb-3 font-mono text-xs tracking-wider uppercase">
            Lines & Text Tokens
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-fg text-xs">fg (#F2E7E1)</span>
                <span className="text-sage font-mono text-[11px]">
                  16.5:1 (AAA)
                </span>
              </div>
              <div className="bg-fg h-2 w-full rounded-full" />
              <p className="text-fg-muted text-[11px]">
                High-contrast primary reading
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-fg text-xs">fg-muted (#A8958F)</span>
                <span className="text-sage font-mono text-[11px]">
                  6.6:1 (AAA)
                </span>
              </div>
              <div className="bg-fg-muted h-2 w-full rounded-full" />
              <p className="text-fg-muted text-[11px]">
                Secondary descriptions
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-fg text-xs">line / line-strong</span>
                <span className="text-fg-dim font-mono text-[11px]">
                  8% / 16% opacity
                </span>
              </div>
              <div className="flex h-2 w-full gap-2">
                <div className="bg-line-strong h-full flex-1 rounded-full" />
                <div className="bg-line h-full flex-1 rounded-full" />
              </div>
              <p className="text-fg-muted text-[11px]">
                Subtle hairline dividers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Typography Scale & Bangla Fallback */}
      <section className="border-line mt-12 border-t pt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-fg text-xl font-medium">
            2. Typography Scale & Fonts
          </h2>
          <span className="text-fg-dim font-mono text-xs">
            Fraunces · Hanken Grotesk · IBM Plex Mono · Hind Siliguri
          </span>
        </div>

        <div className="border-line bg-surface space-y-6 rounded-[6px] border p-6">
          {/* Display Font */}
          <div className="border-line border-b pb-6">
            <span className="text-fg-dim font-mono text-xs tracking-wider uppercase">
              Display Font — Fraunces
            </span>
            <p className="font-display text-fg mt-2 text-4xl">
              Urgent Blood Matching Platform
            </p>
            <p className="font-display text-fg mt-2 text-2xl">
              Every drop carries a pulse of life.
            </p>
          </div>

          {/* Body Font */}
          <div className="border-line border-b pb-6">
            <span className="text-fg-dim font-mono text-xs tracking-wider uppercase">
              Body Sans — Hanken Grotesk
            </span>
            <p className="text-fg mt-2 text-base">
              BloodSync connects emergency recipients with verified donors in
              real time. We prioritize speed, clarity, and geographic proximity
              across all 64 districts.
            </p>
            <p className="text-fg-muted mt-2 text-sm">
              Secondary paragraph text styled in fg-muted for gentle hierarchy
              without losing readability.
            </p>
          </div>

          {/* Mono Font */}
          <div className="border-line border-b pb-6">
            <span className="text-fg-dim font-mono text-xs tracking-wider uppercase">
              Labels & Code — IBM Plex Mono
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              <span className="text-fg font-mono text-sm">
                ID: REQ-2026-8812
              </span>
              <span className="text-blood-text font-mono text-sm">
                BLOOD_GROUP: O_POSITIVE
              </span>
              <span className="text-plasma font-mono text-sm">
                STATUS: IN_PROGRESS
              </span>
              <span className="text-sage font-mono text-sm">
                DONOR: VERIFIED
              </span>
            </div>
          </div>

          {/* Bangla Fallback Sample */}
          <div className="border-blood-deep/40 bg-surface-dark rounded-[6px] border p-5">
            <div className="flex items-center justify-between">
              <span className="text-blood-text font-mono text-xs tracking-wider uppercase">
                Bangla Fallback Test (Hind Siliguri)
              </span>
              <Badge variant="plasma">Bengali Subset</Badge>
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-fg font-sans text-2xl font-medium">
                আমার মায়ের জন্য এ পজিティブ রক্ত লাগবে
              </p>
              <p className="text-fg-muted font-sans text-base">
                জরুরি রক্তের অনুরোধ: &ldquo;আমার মায়ের জন্য এ পজিティブ রক্ত
                লাগবে&rdquo; — ঢাকা মেডিকেল কলেজ হাসপাতাল।
              </p>
              <p className="text-fg-dim font-mono text-xs">
                Font fallback stack: var(--font-hanken),
                var(--font-hind-siliguri), system-ui
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Restyled Components */}
      <section className="border-line mt-12 border-t pt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-fg text-xl font-medium">
            3. Restyled Components
          </h2>
          <span className="text-fg-dim font-mono text-xs">
            Hairline borders · Small radius · Wine palette
          </span>
        </div>

        {/* Buttons */}
        <div className="border-line bg-surface rounded-[6px] border p-6">
          <h3 className="text-fg-dim mb-4 font-mono text-xs tracking-wider uppercase">
            Button Variants & Sizes
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Primary Solid Blood</Button>
            <Button variant="outline">Secondary Outline</Button>
            <Button variant="secondary">Surface Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link Style</Button>
          </div>

          <div className="border-line mt-5 flex flex-wrap items-center gap-3 border-t pt-4">
            <Button size="xs" variant="default">
              XS Button
            </Button>
            <Button size="sm" variant="default">
              SM Button
            </Button>
            <Button size="default" variant="default">
              Default Button
            </Button>
            <Button size="lg" variant="default">
              LG Button
            </Button>
            <Button size="icon" variant="outline" title="Settings">
              <SlidersHorizontalIcon size={16} />
            </Button>
            <Button size="icon-sm" variant="default" title="Alert">
              <BellIcon size={14} />
            </Button>
            <Button variant="default" disabled>
              Disabled State
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="border-line bg-surface mt-6 rounded-[6px] border p-6">
          <h3 className="text-fg-dim mb-4 font-mono text-xs tracking-wider uppercase">
            Badges (Small Mono Uppercase)
          </h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="default">Emergency A+</Badge>
            <Badge variant="secondary">In Progress</Badge>
            <Badge variant="outline">Pending Donor</Badge>
            <Badge variant="plasma">Urgent</Badge>
            <Badge variant="sage">Completed</Badge>
            <Badge variant="destructive">Blocked</Badge>
          </div>
        </div>

        {/* Form Controls: Input, Textarea, Select, Label */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Inputs & Textarea */}
          <div className="border-line bg-surface rounded-[6px] border p-6">
            <h3 className="text-fg-dim mb-4 font-mono text-xs tracking-wider uppercase">
              Form Inputs & Wells
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input id="patient-name" placeholder="e.g. Rahima Begum" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hospital">Hospital Location</Label>
                <Input
                  id="hospital"
                  defaultValue="Dhaka Medical College Hospital, Ward 4"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Medical Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Specify units required, platelets, contact person..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="disabled-input">Disabled Field</Label>
                <Input
                  id="disabled-input"
                  disabled
                  value="System generated tracking number"
                />
              </div>
            </div>
          </div>

          {/* Select & Interactive Overlays */}
          <div className="flex flex-col gap-6">
            {/* Select */}
            <div className="border-line bg-surface rounded-[6px] border p-6">
              <h3 className="text-fg-dim mb-4 font-mono text-xs tracking-wider uppercase">
                Custom Select
              </h3>
              <div className="space-y-2">
                <Label>Required Blood Group</Label>
                <Select
                  value={selectedBloodGroup}
                  onValueChange={(val) => val && setSelectedBloodGroup(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A Positive (A+)</SelectItem>
                    <SelectItem value="A-">A Negative (A-)</SelectItem>
                    <SelectItem value="B+">B Positive (B+)</SelectItem>
                    <SelectItem value="B-">B Negative (B-)</SelectItem>
                    <SelectItem value="O+">O Positive (O+)</SelectItem>
                    <SelectItem value="O-">O Negative (O-)</SelectItem>
                    <SelectItem value="AB+">AB Positive (AB+)</SelectItem>
                    <SelectItem value="AB-">AB Negative (AB-)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-fg-muted mt-1 font-mono text-[11px]">
                  Selected group:{" "}
                  <span className="text-blood-text">{selectedBloodGroup}</span>
                </p>
              </div>
            </div>

            {/* Overlays: Dialog & Sheet */}
            <div className="border-line bg-surface rounded-[6px] border p-6">
              <h3 className="text-fg-dim mb-4 font-mono text-xs tracking-wider uppercase">
                Overlays: Dialog & Sheet
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                {/* Dialog Trigger */}
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button variant="outline">
                        Open Confirmation Dialog
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Blood Request</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to broadcast an urgent request for{" "}
                        <strong className="text-fg">
                          {selectedBloodGroup}
                        </strong>{" "}
                        blood in Dhaka district?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="border-line bg-surface-dark text-fg-muted rounded-[4px] border p-3 text-xs">
                      Notification will be sent to 14 verified donors active
                      within 10km.
                    </div>
                    <DialogFooter showCloseButton>
                      <Button
                        variant="default"
                        onClick={() =>
                          toast.success("Request broadcasted successfully!")
                        }
                      >
                        Broadcast Request
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Sheet Trigger */}
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button variant="secondary">Open Side Sheet</Button>
                    }
                  />
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Donor Profile Details</SheetTitle>
                      <SheetDescription>
                        Review donor eligibility, last donation date, and
                        contact verification.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 p-5">
                      <div className="border-line bg-surface-dark space-y-1 rounded-[6px] border p-3">
                        <span className="text-fg-dim font-mono text-[10px] uppercase">
                          Status
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="bg-sage size-2 rounded-full" />
                          <span className="text-fg text-xs font-medium">
                            Eligible & Ready to Donate
                          </span>
                        </div>
                      </div>
                      <div className="border-line bg-surface-dark space-y-1 rounded-[6px] border p-3">
                        <span className="text-fg-dim font-mono text-[10px] uppercase">
                          Last Donated
                        </span>
                        <p className="text-fg text-xs">
                          94 days ago (March 2026)
                        </p>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs, Dropdown & Tooltip */}
        <div className="border-line bg-surface mt-6 rounded-[6px] border p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-fg-dim font-mono text-xs tracking-wider uppercase">
              Tabs, Dropdown Menu & Tooltips
            </h3>

            <div className="flex items-center gap-3">
              {/* Tooltip */}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button size="xs" variant="outline">
                      Hover for Tooltip
                    </Button>
                  }
                />
                <TooltipContent>
                  <span>WCAG AA compliant blood tint</span>
                </TooltipContent>
              </Tooltip>

              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button size="icon-sm" variant="outline">
                      <DotsThreeVerticalIcon size={16} />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => toast.info("Opening donor card...")}
                  >
                    <span>View Details</span>
                    <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.info("Request shared to clipboard.")}
                  >
                    <span>Share Request</span>
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => toast.error("Request marked as cancelled.")}
                  >
                    <span>Cancel Request</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="border-line bg-surface-dark rounded-[6px] border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">A+</Badge>
                    <div>
                      <p className="text-fg text-sm font-medium">
                        Dhaka Medical College · 2 Bags Needed
                      </p>
                      <p className="text-fg-muted text-xs">
                        Posted 18 minutes ago by Farhan Ahmed
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() =>
                      toast.success("Volunteered for request #8812!")
                    }
                  >
                    Volunteer Now
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="urgent" className="mt-4">
              <div className="border-plasma/30 bg-surface-dark rounded-[6px] border p-4">
                <p className="text-plasma text-sm">
                  1 urgent emergency request matching blood type O- in
                  Chittagong.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <div className="border-sage/30 bg-surface-dark rounded-[6px] border p-4">
                <p className="text-sage text-sm">
                  12 successful donations coordinated in the last 24 hours.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Skeleton Loading State */}
        <div className="border-line bg-surface mt-6 rounded-[6px] border p-6">
          <h3 className="text-fg-dim mb-4 font-mono text-xs tracking-wider uppercase">
            Skeleton Loading State
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-8 w-full" />
          </div>
        </div>

        {/* Sonner Toast Triggers */}
        <div className="border-line bg-surface mt-6 rounded-[6px] border p-6">
          <div className="mb-3 flex items-center gap-2">
            <SparkleIcon size={16} className="text-plasma" />
            <h3 className="text-fg-dim font-mono text-xs tracking-wider uppercase">
              Sonner Themed Notifications
            </h3>
          </div>
          <p className="text-fg-muted mb-4 text-xs">
            Click to trigger notifications styled to the wine & ink palette:
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast.success("Blood match verified! Donor on the way.")
              }
            >
              Test Success Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.warning("Request expires in 30 minutes.")}
            >
              Test Warning Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast.error(
                  "Donor profile is currently ineligible (donated recently)."
                )
              }
            >
              Test Error Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info("New request posted in Mirpur, Dhaka.")}
            >
              Test Info Toast
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Contrast & Accessibility Verification */}
      <section className="border-line bg-surface mt-12 rounded-[6px] border p-6">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon size={20} className="text-sage" />
          <h2 className="font-display text-fg text-lg font-medium">
            4. WCAG AA Contrast Audit & Adjustments
          </h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
          <div className="text-fg-muted space-y-2">
            <p>
              <strong className="text-fg">Standard Pairs:</strong>
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <code className="text-fg">#F2E7E1</code> on{" "}
                <code className="text-fg">#130B0D</code>:{" "}
                <strong>16.5:1</strong> (Passes AAA)
              </li>
              <li>
                <code className="text-fg">#A8958F</code> on{" "}
                <code className="text-fg">#130B0D</code>: <strong>6.6:1</strong>{" "}
                (Passes AAA)
              </li>
              <li>
                <code className="text-fg">#E9B872</code> (plasma) on{" "}
                <code className="text-fg">#130B0D</code>: <strong>9.2:1</strong>{" "}
                (Passes AAA)
              </li>
              <li>
                <code className="text-fg">#7FB89A</code> (sage) on{" "}
                <code className="text-fg">#130B0D</code>: <strong>8.0:1</strong>{" "}
                (Passes AAA)
              </li>
            </ul>
          </div>
          <div className="text-fg-muted space-y-2">
            <p>
              <strong className="text-fg">Adjustments Made:</strong>
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                Solid <code className="text-fg">#D92D43</code> on{" "}
                <code className="text-fg">#130B0D</code> provides{" "}
                <strong>3.55:1</strong> contrast, which passes for large
                text/buttons (&gt;=18pt or &gt;=14pt bold), but fails for small
                body text.
              </li>
              <li>
                <strong className="text-sage">Adjustment:</strong> Added{" "}
                <code className="text-blood-text font-mono">
                  blood-text (#FF6B81)
                </code>{" "}
                (~5.6:1) and{" "}
                <code className="text-blood-light font-mono">
                  blood-light (#F05365)
                </code>{" "}
                (~4.7:1) for small labels, badges, and text links to ensure full
                WCAG AA compliance (&gt;= 4.5:1).
              </li>
              <li>
                Text selection uses <code className="text-fg">#7A1523</code>{" "}
                background with <code className="text-fg">#F2E7E1</code> text
                (~5.2:1 contrast).
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

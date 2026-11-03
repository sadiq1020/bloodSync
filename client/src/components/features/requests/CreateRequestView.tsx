"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import {
  requestFormSchema,
  type RequestFormData,
} from "@/lib/validation/request";
import { AiPasteBox } from "./AiPasteBox";
import { RequestForm } from "./RequestForm";
import { RequestPreview } from "./RequestPreview";
import { Info } from "@phosphor-icons/react";
import type { AiParseResponse, BloodRequest } from "@/types";
import type { BloodGroup } from "@/lib/constants/bloodGroups";
import type { District } from "@/lib/constants/districts";

interface CreateRequestViewProps {
  userName?: string;
  donorPhone?: string;
  initialValues?: Partial<RequestFormData>;
  isCopied?: boolean;
}

export function CreateRequestView({
  userName = "",
  donorPhone = "",
  initialValues,
  isCopied = false,
}: CreateRequestViewProps) {
  const router = useRouter();

  // Snapshot for "Undo AI fill"
  const [undoSnapshot, setUndoSnapshot] = React.useState<RequestFormData | null>(
    null
  );
  const [aiFilledFields, setAiFilledFields] = React.useState<Set<string>>(
    new Set()
  );
  const [checkFields, setCheckFields] = React.useState<Set<string>>(new Set());
  const [flashingFields, setFlashingFields] = React.useState<Set<string>>(
    new Set()
  );

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      forSelf: initialValues?.forSelf ?? false,
      patientName: initialValues?.patientName ?? "",
      bloodGroup: initialValues?.bloodGroup ?? undefined,
      unitsNeeded: initialValues?.unitsNeeded ?? 1,
      hospital: initialValues?.hospital ?? "",
      district: initialValues?.district ?? undefined,
      area: initialValues?.area ?? "",
      urgency: initialValues?.urgency ?? "NORMAL",
      neededBy: "",
      contactPhone: initialValues?.contactPhone || donorPhone || "",
      note: initialValues?.note ?? "",
    },
    mode: "onTouched",
  });

  const {
    getValues,
    setValue,
    reset,
    setError,
    formState: { isDirty, isSubmitSuccessful },
  } = form;

  // Warn user on page navigation / refresh if form has unsaved edits
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitSuccessful) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isSubmitSuccessful]);

  // Handle AI Parse results application
  const handleApplyAiResult = (result: AiParseResponse) => {
    // 1. Save current form values snapshot before overwriting
    setUndoSnapshot(getValues());

    const f = result.fields;
    const newAiFilled = new Set<string>();
    const newFlashing = new Set<string>();
    const newCheck = new Set<string>();

    // Overwrite non-null fields
    if (f.bloodGroup) {
      setValue("bloodGroup", f.bloodGroup as BloodGroup, {
        shouldDirty: true,
        shouldValidate: true,
      });
      newAiFilled.add("bloodGroup");
      newFlashing.add("bloodGroup");
    }
    if (f.district) {
      setValue("district", f.district as District, {
        shouldDirty: true,
        shouldValidate: true,
      });
      newAiFilled.add("district");
      newFlashing.add("district");
    }
    if (f.hospital) {
      setValue("hospital", f.hospital, {
        shouldDirty: true,
        shouldValidate: true,
      });
      newAiFilled.add("hospital");
      newFlashing.add("hospital");
    }
    if (f.area) {
      setValue("area", f.area, {
        shouldDirty: true,
        shouldValidate: true,
      });
      newAiFilled.add("area");
      newFlashing.add("area");
    }
    if (f.patientName) {
      setValue("patientName", f.patientName, {
        shouldDirty: true,
        shouldValidate: true,
      });
      newAiFilled.add("patientName");
      newFlashing.add("patientName");
    }
    if (f.unitsNeeded) {
      setValue("unitsNeeded", f.unitsNeeded, {
        shouldDirty: true,
        shouldValidate: true,
      });
      newAiFilled.add("unitsNeeded");
      newFlashing.add("unitsNeeded");
    }
    if (f.urgency) {
      setValue("urgency", f.urgency, {
        shouldDirty: true,
        shouldValidate: true,
      });
      newAiFilled.add("urgency");
      newFlashing.add("urgency");
    }
    if (f.contactPhone) {
      setValue("contactPhone", f.contactPhone, {
        shouldDirty: true,
        shouldValidate: true,
      });
      newAiFilled.add("contactPhone");
      newFlashing.add("contactPhone");
    }

    // Mark missing fields + neededBy for manual review
    result.missingFields.forEach((fieldKey) => {
      newCheck.add(fieldKey);
    });
    newCheck.add("neededBy"); // neededBy is never inferred by AI

    setAiFilledFields(newAiFilled);
    setCheckFields(newCheck);
    setFlashingFields(newFlashing);

    // Clear flash keyframes after animation finishes
    setTimeout(() => {
      setFlashingFields(new Set());
    }, 1500);
  };

  const handleUndoAi = () => {
    if (undoSnapshot) {
      reset(undoSnapshot);
      setUndoSnapshot(null);
      setAiFilledFields(new Set());
      setCheckFields(new Set());
      setFlashingFields(new Set());
    }
  };

  const handleFieldEdit = (field: keyof RequestFormData) => {
    // Once user manually touches a field, clear its AI tag and check hint
    setAiFilledFields((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
    setCheckFields((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  const mutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      return apiFetch<BloodRequest>("/api/requests", {
        method: "POST",
        body: {
          patientName: data.patientName.trim(),
          bloodGroup: data.bloodGroup,
          unitsNeeded: data.unitsNeeded,
          hospital: data.hospital.trim(),
          district: data.district,
          area: data.area.trim(),
          urgency: data.urgency,
          neededBy: new Date(data.neededBy).toISOString(),
          contactPhone: data.contactPhone.trim(),
          note: data.note ? data.note.trim() : null,
          forSelf: data.forSelf,
        },
      });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 400 && err.errors && Array.isArray(err.errors)) {
          err.errors.forEach((e) => {
            if (e.field) {
              setError(e.field as keyof RequestFormData, {
                message: e.message,
              });
            }
          });
          toast.error("Please check the form for errors.");
          return;
        }
        if (err.status === 429) {
          toast.error("Too many requests. Please wait a moment before trying again.");
          return;
        }
        toast.error(err.message || "Failed to post blood request.");
      } else {
        toast.error("Network error. Please check your internet connection.");
      }
    },
    onSuccess: (data) => {
      toast.success("Request posted.");
      const requestId = data?.id;
      if (requestId) {
        router.push(`/requests/${requestId}?created=1`);
      } else {
        router.push("/requests");
      }
    },
  });

  const onSubmit = (data: RequestFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
      {/* Left Column (about 7/12): AiPasteBox + RequestForm */}
      <div className="lg:col-span-7 space-y-6">
        <AiPasteBox
          onApplyResult={handleApplyAiResult}
          onUndo={handleUndoAi}
          canUndo={undoSnapshot !== null}
        />

        {isCopied && (
          <div className="flex items-center gap-2 rounded-[4px] border border-plasma/30 bg-plasma/10 px-3.5 py-2.5 font-mono text-xs text-plasma">
            <Info className="h-4 w-4 shrink-0" weight="bold" />
            <span>Copied from your earlier request. Set a new time.</span>
          </div>
        )}

        <RequestForm
          form={form}
          onSubmit={onSubmit}
          isPending={mutation.isPending}
          userName={userName}
          aiFilledFields={aiFilledFields}
          checkFields={checkFields}
          flashingFields={flashingFields}
          onFieldEdit={handleFieldEdit}
        />
      </div>

      {/* Right Column (about 5/12): Sticky Live Preview (Desktop only) */}
      <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24">
        <RequestPreview control={form.control} />
      </div>
    </div>
  );
}

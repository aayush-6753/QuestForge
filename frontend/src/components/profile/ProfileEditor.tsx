import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateMe } from "../../hooks/useMe";
import type { Profile } from "../../types/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const profileSchema = z.object({
  displayName: z.string().trim().max(80, "Use 80 characters or fewer."),
  timezone: z
    .string()
    .trim()
    .min(1, "Choose a timezone.")
    .max(100, "Use 100 characters or fewer.")
    .refine((timezone) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: timezone });
        return true;
      } catch {
        return false;
      }
    }, "Enter a valid IANA timezone."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type IntlWithSupportedValues = typeof Intl & {
  supportedValuesOf?: (key: "timeZone") => string[];
};

const browserTimezones = (Intl as IntlWithSupportedValues).supportedValuesOf?.("timeZone") ?? [];
const timezoneOptions = Array.from(new Set(["UTC", ...browserTimezones]));

export function ProfileEditor({ profile, onCancel }: { profile: Profile; onCancel: () => void }) {
  const updateMe = useUpdateMe();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile.displayName ?? "",
      timezone: profile.timezone,
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    try {
      await updateMe.mutateAsync({
        displayName: values.displayName || null,
        timezone: values.timezone,
      });
      onCancel();
    } catch {
      // React Query exposes the request error below the form.
    }
  }

  const mutationError = updateMe.error instanceof Error ? updateMe.error.message : null;

  return (
    <section className="border-y border-vellum/10 bg-coal/60 px-4 py-5 sm:px-5" aria-labelledby="profile-settings-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-ember">Profile</p>
          <h2 id="profile-settings-title" className="font-display text-2xl text-vellum">
            Adventurer settings
          </h2>
        </div>
        <Button type="button" variant="ghost" className="min-h-10 px-3" onClick={onCancel} aria-label="Close profile settings">
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <form
        className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        noValidate
      >
        <Input label="Display name" autoComplete="nickname" error={errors.displayName?.message} {...register("displayName")} />
        <Input
          label="Timezone"
          list="timezone-options"
          autoComplete="off"
          error={errors.timezone?.message}
          {...register("timezone")}
        />
        <datalist id="timezone-options">
          {timezoneOptions.map((timezone) => (
            <option key={timezone} value={timezone} />
          ))}
        </datalist>
        <div className="flex gap-2 lg:pb-0.5">
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1 lg:flex-none">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || updateMe.isPending} className="flex-1 lg:flex-none">
            <Save className="h-4 w-4" aria-hidden="true" />
            {isSubmitting || updateMe.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>

      {mutationError ? (
        <p className="mt-3 rounded-md border border-ruby/40 bg-ruby/10 px-3 py-2 text-sm text-ruby" role="alert">
          {mutationError}
        </p>
      ) : null}
    </section>
  );
}

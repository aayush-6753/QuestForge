import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  QUEST_CATEGORIES,
  QUEST_DIFFICULTIES,
  type Quest,
  type SaveQuestInput,
} from "../../types/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const questFormSchema = z.object({
  title: z.string().trim().min(1, "Enter a quest title.").max(120, "Use 120 characters or fewer."),
  description: z.string().trim().max(2_000, "Use 2000 characters or fewer."),
  category: z.enum(QUEST_CATEGORIES),
  difficulty: z.enum(QUEST_DIFFICULTIES),
  dueAt: z
    .string()
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "Enter a valid due date."),
});

type QuestFormValues = z.infer<typeof questFormSchema>;

function enumLabel(value: string) {
  const lower = value.toLowerCase();
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

function toLocalDateTime(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function QuestForm({
  quest,
  isPending,
  error,
  onCancel,
  onSubmit,
}: {
  quest?: Quest;
  isPending: boolean;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (input: SaveQuestInput) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<QuestFormValues>({
    resolver: zodResolver(questFormSchema),
    defaultValues: {
      title: quest?.title ?? "",
      description: quest?.description ?? "",
      category: quest?.category ?? "PERSONAL",
      difficulty: quest?.difficulty ?? "EASY",
      dueAt: toLocalDateTime(quest?.dueAt ?? null),
    },
  });

  async function submit(values: QuestFormValues) {
    const dueAt = values.dueAt ? new Date(values.dueAt) : null;
    const dueAtUnchanged = values.dueAt === toLocalDateTime(quest?.dueAt ?? null);

    if (dueAt && dueAt.getTime() <= Date.now() && !dueAtUnchanged) {
      setError("dueAt", { message: "Choose a future due date." });
      return;
    }

    try {
      await onSubmit({
        title: values.title,
        description: values.description || null,
        category: values.category,
        difficulty: values.difficulty,
        dueAt: dueAtUnchanged ? quest?.dueAt ?? null : dueAt?.toISOString() ?? null,
      });
    } catch {
      // The mutation exposes its error below the form.
    }
  }

  const inputClassName =
    "min-h-12 rounded-md border border-vellum/15 bg-ink/70 px-3 text-base text-vellum focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/35";

  return (
    <form
      className="border-y border-vellum/10 bg-ink/30 px-1 py-5"
      onSubmit={(event) => void handleSubmit(submit)(event)}
      noValidate
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-ember">{quest ? "Edit quest" : "New quest"}</p>
          <h3 className="font-display text-xl text-vellum">{quest ? quest.title : "Set your next objective"}</h3>
        </div>
        <Button type="button" variant="ghost" className="min-h-10 px-3" onClick={onCancel} aria-label="Close quest form">
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Title" error={errors.title?.message} {...register("title")} />
        </div>

        <label className="grid gap-2 text-sm font-semibold text-parchment/90">
          Category
          <select className={inputClassName} {...register("category")}>
            {QUEST_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {enumLabel(category)}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-parchment/90">
          Difficulty
          <select className={inputClassName} {...register("difficulty")}>
            {QUEST_DIFFICULTIES.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {enumLabel(difficulty)}
              </option>
            ))}
          </select>
        </label>

        <Input label="Due date" type="datetime-local" error={errors.dueAt?.message} {...register("dueAt")} />

        <label className="grid gap-2 text-sm font-semibold text-parchment/90 sm:col-span-2">
          Description
          <textarea
            id="quest-description"
            className={`${inputClassName} min-h-24 resize-y py-3`}
            maxLength={2_000}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "quest-description-error" : undefined}
            {...register("description")}
          />
          {errors.description ? (
            <span id="quest-description-error" className="text-sm font-medium text-ruby">
              {errors.description.message}
            </span>
          ) : null}
        </label>
      </div>

      {error ? (
        <p className="mt-4 border-l-2 border-ruby bg-ruby/10 px-3 py-2 text-sm text-ruby" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || isSubmitting}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {isPending || isSubmitting ? "Saving..." : "Save quest"}
        </Button>
      </div>
    </form>
  );
}

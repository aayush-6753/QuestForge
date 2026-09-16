import { Archive, CalendarClock, Check, CheckCircle2, Coins, Pencil, Plus, RotateCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { useArchiveQuest, useCompleteQuest, useCreateQuest, useQuests, useUpdateQuest } from "../../hooks/useQuests";
import { cn } from "../../lib/cn";
import {
  QUEST_STATUSES,
  type CompleteQuestResponse,
  type Quest,
  type QuestStatus,
  type SaveQuestInput,
} from "../../types/api";
import { Button } from "../ui/AppButton";
import { CompletionFeedback } from "./CompletionFeedback";
import { EmptyQuestState } from "./EmptyQuestState";
import { QuestForm } from "./QuestForm";

const statusLabels: Record<QuestStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const difficultyStyles: Record<Quest["difficulty"], string> = {
  EASY: "text-emerald",
  MEDIUM: "text-citrine",
  HARD: "text-ruby",
  EPIC: "text-amethyst",
};

function enumLabel(value: string) {
  const lower = value.toLowerCase();
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function mutationMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

export function QuestBoard() {
  const [status, setStatus] = useState<QuestStatus>("ACTIVE");
  const [editor, setEditor] = useState<{ mode: "create" } | { mode: "edit"; quest: Quest } | null>(null);
  const [completionResult, setCompletionResult] = useState<CompleteQuestResponse | null>(null);
  const quests = useQuests(status);
  const createQuest = useCreateQuest();
  const updateQuest = useUpdateQuest();
  const archiveQuest = useArchiveQuest();
  const completeQuest = useCompleteQuest();

  function closeEditor() {
    setEditor(null);
    createQuest.reset();
    updateQuest.reset();
  }

  function changeStatus(nextStatus: QuestStatus) {
    setStatus(nextStatus);
    closeEditor();
    archiveQuest.reset();
    completeQuest.reset();
    setCompletionResult(null);
  }

  async function saveQuest(input: SaveQuestInput) {
    if (editor?.mode === "edit") {
      await updateQuest.mutateAsync({ questId: editor.quest.id, input });
    } else {
      await createQuest.mutateAsync(input);
      setStatus("ACTIVE");
    }

    closeEditor();
  }

  async function confirmArchive(quest: Quest) {
    if (!window.confirm(`Archive "${quest.title}"?`)) return;

    try {
      completeQuest.reset();
      await archiveQuest.mutateAsync(quest.id);
      if (editor?.mode === "edit" && editor.quest.id === quest.id) closeEditor();
    } catch {
      // The mutation error remains visible above the list.
    }
  }

  async function confirmCompletion(quest: Quest) {
    if (!window.confirm(`Complete "${quest.title}"? This cannot be undone.`)) return;

    try {
      archiveQuest.reset();
      setCompletionResult(null);
      setCompletionResult(await completeQuest.mutateAsync(quest.id));
      if (editor?.mode === "edit" && editor.quest.id === quest.id) closeEditor();
    } catch {
      // The mutation error remains visible above the list.
    }
  }

  const editorError = mutationMessage(editor?.mode === "edit" ? updateQuest.error : createQuest.error);
  const archiveError = mutationMessage(archiveQuest.error);
  const completionError = mutationMessage(completeQuest.error);
  const questMutationPending = archiveQuest.isPending || completeQuest.isPending;

  return (
    <section id="quests" className="panel min-w-0 px-4 py-5 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Quest board</p>
          <h2 className="font-display text-2xl text-vellum">Your Objectives</h2>
        </div>
        <Button
          type="button"
          disabled={questMutationPending}
          onClick={() => {
            createQuest.reset();
            updateQuest.reset();
            archiveQuest.reset();
            completeQuest.reset();
            setEditor({ mode: "create" });
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New quest
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-3 border border-vellum/15 bg-ink/45 p-1" aria-label="Quest status">
        {QUEST_STATUSES.map((option) => (
          <button
            key={option}
            type="button"
            disabled={questMutationPending}
            className={cn(
              "min-h-10 px-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
              status === option ? "bg-ember text-ink" : "text-parchment/70 hover:bg-vellum/5 hover:text-vellum",
            )}
            aria-pressed={status === option}
            onClick={() => changeStatus(option)}
          >
            {statusLabels[option]}
          </button>
        ))}
      </div>

      {editor ? (
        <div className="mt-5">
          <QuestForm
            key={editor.mode === "edit" ? editor.quest.id : "create"}
            quest={editor.mode === "edit" ? editor.quest : undefined}
            isPending={createQuest.isPending || updateQuest.isPending}
            error={editorError}
            onCancel={closeEditor}
            onSubmit={saveQuest}
          />
        </div>
      ) : null}

      {completionResult ? (
        <div className="mt-5">
          <CompletionFeedback result={completionResult} onDismiss={() => setCompletionResult(null)} />
        </div>
      ) : null}

      {archiveError || completionError ? (
        <p className="mt-4 border-l-2 border-ruby bg-ruby/10 px-3 py-2 text-sm text-ruby" role="alert">
          {archiveError ?? completionError}
        </p>
      ) : null}

      <div className="mt-5" aria-live="polite">
        {quests.isLoading ? <p className="py-8 text-center text-sm text-parchment/65">Loading quests...</p> : null}

        {quests.isError ? (
          <div className="border-y border-ruby/35 bg-ruby/10 px-4 py-5 text-center">
            <p className="text-sm text-ruby">
              {quests.error instanceof Error ? quests.error.message : "Unable to load quests."}
            </p>
            <Button variant="secondary" className="mt-3" onClick={() => void quests.refetch()}>
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : null}

        {quests.data?.length === 0 ? <EmptyQuestState status={status} /> : null}

        {quests.data?.length ? (
          <div className="divide-y divide-vellum/10 border-y border-vellum/15">
            {quests.data.map((quest) => (
              <article key={quest.id} className="relative py-5 first:pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-wider">
                      <span className={difficultyStyles[quest.difficulty]}>{enumLabel(quest.difficulty)}</span>
                      <span className="text-sapphire">{enumLabel(quest.category)}</span>
                      <span className="text-parchment/55">{enumLabel(quest.targetAttribute)}</span>
                    </div>
                    <h3 className="mt-2 break-words font-display text-2xl text-vellum">{quest.title}</h3>
                    {quest.description ? (
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-parchment/70">
                        {quest.description}
                      </p>
                    ) : null}
                  </div>

                  {quest.status === "ACTIVE" ? (
                    <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="min-h-10 px-3"
                        disabled={questMutationPending}
                        onClick={() => {
                          createQuest.reset();
                          updateQuest.reset();
                          setEditor({ mode: "edit", quest });
                        }}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        className="min-h-10 px-3"
                        disabled={questMutationPending}
                        onClick={() => void confirmCompletion(quest)}
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        {completeQuest.isPending && completeQuest.variables === quest.id ? "Completing..." : "Complete"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="min-h-10 px-3 text-ruby"
                        disabled={questMutationPending}
                        onClick={() => void confirmArchive(quest)}
                      >
                        <Archive className="h-4 w-4" aria-hidden="true" />
                        Archive
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-parchment/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-ember" aria-hidden="true" />
                    {quest.baseXp} XP
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-citrine" aria-hidden="true" />
                    {quest.baseGold} gold
                  </span>
                  {quest.dueAt ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock className="h-4 w-4 text-sapphire" aria-hidden="true" />
                      Due {formatDate(quest.dueAt)}
                    </span>
                  ) : null}
                  {quest.completedAt ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald" aria-hidden="true" />
                      Completed {formatDate(quest.completedAt)}
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

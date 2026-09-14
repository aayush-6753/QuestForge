import { ScrollText } from "lucide-react";
import type { QuestStatus } from "../../types/api";

const emptyLabels: Record<QuestStatus, { title: string; detail: string }> = {
  ACTIVE: { title: "No active quests", detail: "Create an objective to begin." },
  COMPLETED: { title: "No completed quests", detail: "Completed objectives will appear here." },
  ARCHIVED: { title: "No archived quests", detail: "Archived objectives will appear here." },
};

export function EmptyQuestState({ status }: { status: QuestStatus }) {
  const label = emptyLabels[status];

  return (
    <div className="border-y border-dashed border-ember/35 bg-ink/20 p-6 text-center">
      <ScrollText className="mx-auto h-9 w-9 text-ember" aria-hidden="true" />
      <h3 className="mt-3 font-display text-xl text-vellum">{label.title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-parchment/70">{label.detail}</p>
    </div>
  );
}

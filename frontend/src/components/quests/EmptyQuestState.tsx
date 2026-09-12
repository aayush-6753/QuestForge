import { ScrollText } from "lucide-react";

export function EmptyQuestState() {
  return (
    <div className="rounded-lg border border-dashed border-ember/35 bg-ink/35 p-6 text-center">
      <ScrollText className="mx-auto h-9 w-9 text-ember" aria-hidden="true" />
      <h3 className="mt-3 font-display text-xl text-vellum">No quests yet</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-parchment/70">Your adventure begins here.</p>
    </div>
  );
}

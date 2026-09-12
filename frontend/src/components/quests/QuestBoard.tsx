import { EmptyQuestState } from "./EmptyQuestState";

export function QuestBoard() {
  return (
    <section id="quests" className="rounded-lg border border-vellum/10 bg-coal/80 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-ember">Quest board</p>
          <h2 className="font-display text-2xl text-vellum">Active Quests</h2>
        </div>
      </div>
      <EmptyQuestState />
    </section>
  );
}

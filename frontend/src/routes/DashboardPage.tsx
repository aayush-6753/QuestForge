import { Store, WandSparkles } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { AttributeCard } from "../components/game/AttributeCard";
import { CharacterCard } from "../components/game/CharacterCard";
import { QuestBoard } from "../components/quests/QuestBoard";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { PageContainer } from "../components/ui/PageContainer";
import { useMe } from "../hooks/useMe";

export function DashboardPage() {
  const me = useMe();

  if (me.isLoading) {
    return <LoadingSkeleton label="Opening your chronicle" />;
  }

  if (me.isError) {
    const message = me.error instanceof Error ? me.error.message : "Unable to load your character foundation.";

    return (
      <AppShell>
        <PageContainer>
          <ErrorState message={message} onRetry={() => void me.refetch()} />
        </PageContainer>
      </AppShell>
    );
  }

  if (!me.data) {
    return (
      <AppShell>
        <PageContainer>
          <ErrorState message="No character data was returned." onRetry={() => void me.refetch()} />
        </PageContainer>
      </AppShell>
    );
  }

  const data = me.data;

  return (
    <AppShell>
      <PageContainer className="grid gap-5">
        <CharacterCard character={data.character} profile={data.profile} progression={data.progression.character} />

        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
          <QuestBoard />

          <section id="attributes" className="rounded-lg border border-vellum/10 bg-coal/80 p-5">
            <p className="text-sm font-bold uppercase text-ember">Attributes</p>
            <h2 className="font-display text-2xl text-vellum">Character Growth</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.attributes.map((attribute) => (
                <AttributeCard key={attribute.id} attribute={attribute} />
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section id="activity" className="rounded-lg border border-vellum/10 bg-coal/80 p-5">
            <div className="flex items-start gap-3">
              <WandSparkles className="mt-1 h-6 w-6 text-amethyst" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold uppercase text-ember">Recent activity</p>
                <h2 className="font-display text-2xl text-vellum">No entries yet</h2>
                <p className="mt-2 text-sm leading-6 text-parchment/70">
                  Quest completions and progression history will appear here once those systems are implemented.
                </p>
              </div>
            </div>
          </section>

          <section id="shop" className="rounded-lg border border-vellum/10 bg-coal/80 p-5">
            <div className="flex items-start gap-3">
              <Store className="mt-1 h-6 w-6 text-emerald" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold uppercase text-ember">Shop</p>
                <h2 className="font-display text-2xl text-vellum">Rewards locked</h2>
                <p className="mt-2 text-sm leading-6 text-parchment/70">
                  Cosmetic rewards are modeled in the database, but purchasing stays disabled until transactional rules
                  are built.
                </p>
              </div>
            </div>
          </section>
        </div>
      </PageContainer>
    </AppShell>
  );
}

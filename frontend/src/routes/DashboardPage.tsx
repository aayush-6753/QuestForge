import { useState } from "react";
import { ActivityTimeline } from "../components/activity/ActivityTimeline";
import { AppShell } from "../components/layout/AppShell";
import { AttributeCard } from "../components/game/AttributeCard";
import { CharacterCard } from "../components/game/CharacterCard";
import { ProfileEditor } from "../components/profile/ProfileEditor";
import { QuestBoard } from "../components/quests/QuestBoard";
import { RewardShop } from "../components/rewards/RewardShop";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { PageContainer } from "../components/ui/PageContainer";
import { useMe } from "../hooks/useMe";

export function DashboardPage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
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
        <CharacterCard
          character={data.character}
          profile={data.profile}
          progression={data.progression.character}
          onEdit={() => setIsEditingProfile(true)}
        />

        {isEditingProfile ? <ProfileEditor profile={data.profile} onCancel={() => setIsEditingProfile(false)} /> : null}

        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
          <QuestBoard />

          <section id="attributes" className="rounded-lg border border-vellum/10 bg-coal/80 p-5">
            <p className="text-sm font-bold uppercase text-ember">Attributes</p>
            <h2 className="font-display text-2xl text-vellum">Character Growth</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.attributes.map((attribute) => (
                <AttributeCard
                  key={attribute.id}
                  attribute={attribute}
                  progression={data.progression.attributes.find((summary) => summary.type === attribute.type)}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <ActivityTimeline />
          <RewardShop gold={data.character.gold} />
        </div>
      </PageContainer>
    </AppShell>
  );
}

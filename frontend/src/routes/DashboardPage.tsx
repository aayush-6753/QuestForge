import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
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

const sections = {
  chronicle: "Adventurer Chronicle",
  quests: "Quest Board",
  attributes: "Character Attributes",
  shop: "Guild Shop",
  activity: "Activity Chronicle",
} as const;

type Section = keyof typeof sections;

function isSection(value: string): value is Section {
  return value in sections;
}

export function DashboardPage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { section: sectionParam } = useParams();
  const section = sectionParam ?? "chronicle";
  const me = useMe();

  if (!isSection(section)) {
    return <Navigate to="/app" replace />;
  }

  if (me.isLoading) {
    return <LoadingSkeleton label="Opening your chronicle" />;
  }

  if (me.isError) {
    const message = me.error instanceof Error ? me.error.message : "Unable to load your character foundation.";

    return (
      <AppShell title={sections[section]}>
        <PageContainer>
          <ErrorState message={message} onRetry={() => void me.refetch()} />
        </PageContainer>
      </AppShell>
    );
  }

  if (!me.data) {
    return (
      <AppShell title={sections[section]}>
        <PageContainer>
          <ErrorState message="No character data was returned." onRetry={() => void me.refetch()} />
        </PageContainer>
      </AppShell>
    );
  }

  const data = me.data;

  return (
    <AppShell title={sections[section]}>
      <PageContainer className="grid gap-5">
        {section === "chronicle" ? (
          <>
            <CharacterCard
              character={data.character}
              profile={data.profile}
              progression={data.progression.character}
              onEdit={() => setIsEditingProfile(true)}
            />

            {isEditingProfile ? <ProfileEditor profile={data.profile} onCancel={() => setIsEditingProfile(false)} /> : null}

            <section className="grid gap-3 md:grid-cols-3">
              <article className="rounded-lg border border-vellum/10 bg-coal/80 p-5">
                <p className="text-xs font-bold uppercase text-ember">Timezone</p>
                <p className="mt-2 text-lg font-semibold text-vellum">{data.profile.timezone}</p>
              </article>
              <article className="rounded-lg border border-vellum/10 bg-coal/80 p-5">
                <p className="text-xs font-bold uppercase text-ember">Total XP</p>
                <p className="mt-2 text-lg font-semibold text-vellum">{data.character.totalXp}</p>
              </article>
              <article className="rounded-lg border border-vellum/10 bg-coal/80 p-5">
                <p className="text-xs font-bold uppercase text-ember">Longest streak</p>
                <p className="mt-2 text-lg font-semibold text-vellum">{data.character.longestStreak} days</p>
              </article>
            </section>
          </>
        ) : null}

        {section === "quests" ? (
          <QuestBoard />
        ) : null}

        {section === "attributes" ? (
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
        ) : null}

        {section === "shop" ? (
          <RewardShop gold={data.character.gold} />
        ) : null}

        {section === "activity" ? (
          <ActivityTimeline />
        ) : null}
      </PageContainer>
    </AppShell>
  );
}

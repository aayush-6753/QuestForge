import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
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
import { useQuests } from "../hooks/useQuests";

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
            <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr] xl:items-stretch">
              <CharacterCard
                character={data.character}
                profile={data.profile}
                progression={data.progression.character}
                onEdit={() => setIsEditingProfile(true)}
              />
              <CurrentQuest />
            </div>

            {isEditingProfile ? <ProfileEditor profile={data.profile} onCancel={() => setIsEditingProfile(false)} /> : null}

            <section className="grid gap-3 md:grid-cols-3" aria-label="Character record">
              <article className="panel-soft border-l-2 border-l-sapphire p-5">
                <p className="eyebrow">Timezone</p>
                <p className="mt-2 text-lg font-semibold text-vellum">{data.profile.timezone}</p>
              </article>
              <article className="panel-soft border-l-2 border-l-ember p-5">
                <p className="eyebrow">Total XP</p>
                <p className="mt-1 font-display text-3xl text-vellum">{data.character.totalXp}</p>
              </article>
              <article className="panel-soft border-l-2 border-l-ruby p-5">
                <p className="eyebrow">Longest streak</p>
                <p className="mt-1 font-display text-3xl text-vellum">{data.character.longestStreak}<span className="ml-1 text-base text-parchment/65">days</span></p>
              </article>
            </section>
          </>
        ) : null}

        {section === "quests" ? (
          <QuestBoard />
        ) : null}

        {section === "attributes" ? (
          <section id="attributes" className="panel p-5">
            <p className="eyebrow">Attributes</p>
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

function CurrentQuest() {
  const quests = useQuests("ACTIVE");
  const quest = quests.data?.[0];

  if (quests.isLoading) {
    return <section className="panel grid min-h-64 content-center p-5" aria-busy="true"><p className="eyebrow">Current quest</p><div className="mt-4 h-8 w-3/4 animate-pulse bg-vellum/10" /></section>;
  }

  if (!quest) {
    return (
      <section className="panel flex min-h-64 flex-col justify-between p-5">
        <div><p className="eyebrow">Current quest</p><h2 className="mt-3 font-display text-3xl text-vellum">Your quest log is clear.</h2><p className="mt-3 max-w-md text-sm leading-6 text-parchment/70">Create a mission to begin earning character progress.</p></div>
        <Link to="/app/quests" className="hard-button mt-6 w-fit">Create quest <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </section>
    );
  }

  return (
    <section className="panel relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-1 bg-ember" />
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-vellum/15 pb-4">
        <div><p className="eyebrow">Current quest</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-system">Active · {quest.category}</p></div>
        <span className="border border-ember/45 bg-ember/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-ember">{quest.difficulty}</span>
      </div>
      <h2 className="mt-5 max-w-2xl font-display text-3xl leading-tight text-vellum sm:text-4xl">{quest.title}</h2>
      {quest.description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-parchment/70">{quest.description}</p> : null}
      <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 border-y border-vellum/15 py-4 text-sm">
        <p><span className="eyebrow mr-2 inline text-[10px]">Reward</span><span className="font-mono font-bold text-citrine">+{quest.baseXp} XP</span></p>
        <p><span className="eyebrow mr-2 inline text-[10px]">Growth</span><span className="font-mono font-bold text-vellum">{quest.targetAttribute}</span></p>
        <p><span className="eyebrow mr-2 inline text-[10px]">Gold</span><span className="font-mono font-bold text-vellum">+{quest.baseGold}</span></p>
      </div>
      <Link to="/app/quests" className="hard-button mt-5">Continue quest <Sparkles className="h-4 w-4" aria-hidden="true" /></Link>
    </section>
  );
}

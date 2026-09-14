import {
  Archive,
  CircleDot,
  Flame,
  Gift,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useActivity } from "../../hooks/useActivity";
import type { ActivityEvent } from "../../types/api";
import { Button } from "../ui/Button";

type EventView = { label: string; detail: string; icon: LucideIcon };

function textValue(metadata: ActivityEvent["metadata"], key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
}

function numberValue(metadata: ActivityEvent["metadata"], key: string) {
  const value = metadata?.[key];
  return typeof value === "number" ? value : null;
}

function eventView(event: ActivityEvent): EventView {
  const title = textValue(event.metadata, "questTitle") ?? "Quest";
  const reward = textValue(event.metadata, "rewardName") ?? "Reward";

  switch (event.type) {
    case "QUEST_CREATED":
      return { label: "Quest created", detail: title, icon: ScrollText };
    case "QUEST_COMPLETED":
      return {
        label: "Quest completed",
        detail: `${title} earned ${numberValue(event.metadata, "awardedXp") ?? 0} XP`,
        icon: ShieldCheck,
      };
    case "QUEST_ARCHIVED":
      return { label: "Quest archived", detail: title, icon: Archive };
    case "LEVEL_UP":
      return { label: "Level gained", detail: `Reached level ${numberValue(event.metadata, "currentLevel") ?? "?"}`, icon: Trophy };
    case "STREAK_UPDATED":
      return { label: "Streak advanced", detail: `${numberValue(event.metadata, "currentStreak") ?? 0} active days`, icon: Flame };
    case "REWARD_PURCHASED":
      return { label: "Reward purchased", detail: reward, icon: ShoppingBag };
    case "REWARD_EQUIPPED":
      return { label: "Reward equipped", detail: reward, icon: Sparkles };
    case "REWARD_UNEQUIPPED":
      return { label: "Reward unequipped", detail: reward, icon: Gift };
    default:
      return { label: "Chronicle updated", detail: "Your journey changed.", icon: CircleDot };
  }
}

export function ActivityTimeline() {
  const activity = useActivity();
  const events = activity.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section id="activity" className="rounded-lg border border-vellum/10 bg-coal/80 p-5">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 h-6 w-6 text-amethyst" aria-hidden="true" />
        <div>
          <p className="text-sm font-bold uppercase text-ember">Recent activity</p>
          <h2 className="font-display text-2xl text-vellum">Your Chronicle</h2>
        </div>
      </div>

      {activity.isLoading ? <p className="mt-5 text-sm text-parchment/70">Opening the chronicle...</p> : null}
      {activity.isError ? (
        <div className="mt-5" role="alert">
          <p className="text-sm text-ruby">{activity.error.message}</p>
          <Button className="mt-3" variant="secondary" onClick={() => void activity.refetch()}>
            Try again
          </Button>
        </div>
      ) : null}
      {!activity.isLoading && !activity.isError && events.length === 0 ? (
        <p className="mt-5 text-sm leading-6 text-parchment/70">Complete a quest to write the first entry.</p>
      ) : null}

      {events.length > 0 ? (
        <ol className="mt-4 divide-y divide-vellum/10">
          {events.map((event) => {
            const view = eventView(event);
            return (
              <li key={event.id} className="flex gap-3 py-4 first:pt-1">
                <view.icon className="mt-0.5 h-5 w-5 shrink-0 text-ember" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-vellum">{view.label}</p>
                  <p className="truncate text-sm text-parchment/70">{view.detail}</p>
                </div>
                <time className="shrink-0 text-xs text-parchment/55" dateTime={event.createdAt}>
                  {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(event.createdAt))}
                </time>
              </li>
            );
          })}
        </ol>
      ) : null}

      {activity.hasNextPage ? (
        <Button
          className="mt-3 w-full"
          variant="secondary"
          disabled={activity.isFetchingNextPage}
          onClick={() => void activity.fetchNextPage()}
        >
          {activity.isFetchingNextPage ? "Loading..." : "Load older entries"}
        </Button>
      ) : events.length > 0 ? (
        <p className="mt-3 text-center text-xs text-parchment/50">Beginning of your chronicle</p>
      ) : null}
    </section>
  );
}

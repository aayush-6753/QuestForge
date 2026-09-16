import type { CharacterAttribute, ProgressionSummary } from "../../types/api";
import { cn } from "../../lib/cn";
import { XPProgressBar } from "./XPProgressBar";

const attributeStyles: Record<CharacterAttribute["type"], string> = {
  STRENGTH: "border-strength bg-ruby/10 text-ruby",
  INTELLECT: "border-knowledge bg-sapphire/10 text-sapphire",
  DISCIPLINE: "border-discipline bg-discipline-active/10 text-discipline-active",
  CREATIVITY: "border-creativity bg-amethyst/10 text-amethyst",
  VITALITY: "border-adventure bg-emerald/10 text-emerald",
};

const labels: Record<CharacterAttribute["type"], string> = {
  STRENGTH: "Strength",
  INTELLECT: "Intellect",
  DISCIPLINE: "Discipline",
  CREATIVITY: "Creativity",
  VITALITY: "Vitality",
};

export function AttributeCard({
  attribute,
  progression,
}: {
  attribute: CharacterAttribute;
  progression?: ProgressionSummary;
}) {
  return (
    <article className={cn("border p-4", attributeStyles[attribute.type])}>
      <h3 className="font-display text-lg text-vellum">{labels[attribute.type]}</h3>
      <p className="mt-2 text-sm text-parchment/75">
        Level {progression?.level ?? attribute.level} - {attribute.xp} total XP
      </p>
      {progression ? (
        <div className="mt-4 text-parchment">
          <XPProgressBar progression={progression} label={`${labels[attribute.type]} XP`} />
        </div>
      ) : null}
    </article>
  );
}

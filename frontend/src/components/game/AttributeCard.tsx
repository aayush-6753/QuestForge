import type { CharacterAttribute } from "../../types/api";
import { cn } from "../../lib/cn";

const attributeStyles: Record<CharacterAttribute["type"], string> = {
  STRENGTH: "border-ruby/35 bg-ruby/10 text-ruby",
  INTELLECT: "border-sapphire/35 bg-sapphire/10 text-sapphire",
  DISCIPLINE: "border-citrine/35 bg-citrine/10 text-citrine",
  CREATIVITY: "border-amethyst/35 bg-amethyst/10 text-amethyst",
  VITALITY: "border-emerald/35 bg-emerald/10 text-emerald",
};

const labels: Record<CharacterAttribute["type"], string> = {
  STRENGTH: "Strength",
  INTELLECT: "Intellect",
  DISCIPLINE: "Discipline",
  CREATIVITY: "Creativity",
  VITALITY: "Vitality",
};

export function AttributeCard({ attribute }: { attribute: CharacterAttribute }) {
  return (
    <article className={cn("rounded-lg border p-4", attributeStyles[attribute.type])}>
      <h3 className="font-display text-lg text-vellum">{labels[attribute.type]}</h3>
      <p className="mt-2 text-sm text-parchment/75">{attribute.xp} attribute XP</p>
    </article>
  );
}

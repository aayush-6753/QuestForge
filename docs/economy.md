# Life RPG Economy Design

Status: Proposed target design. The formulas, duration-based rewards, weighted
skills, campaigns, and user-defined rewards in this document are not all part
of the current implementation.

## Design Principles

Life RPG separates progression into three systems:

- **XP** measures personal progression and grows conservatively.
- **Gold** measures execution efficiency and funds rewards.
- **Character stats** measure long-term mastery through repeated practice.

These systems deliberately use different growth curves so one strategy cannot
efficiently farm all three.

> Gold rewards how efficiently you execute. XP rewards what you accomplish.
> Character stats reward what you repeatedly practice.

## Quest Inputs

Each quest needs the following economy data:

```text
Planned duration (D)
Actual duration (A)
Difficulty
Quest category and weighted skills
Base XP
Base Gold
Started at
Due at
Completed at
```

`D` and `A` are measured in days. The original deadline, difficulty, and skill
weights become immutable when a quest starts. Editing a deadline later must
not restore or increase an early-completion bonus.

Example:

```text
Quest: Complete website
Planned duration: 7 days
Actual duration: 4 days
Difficulty: Normal
Skills: Coding, Design, Discipline
```

## Difficulty Multipliers

| Difficulty | Multiplier |
| --- | ---: |
| Trivial | 0.60 |
| Easy | 0.80 |
| Normal | 1.00 |
| Hard | 1.30 |
| Epic | 1.70 |
| Legendary | 2.20 |

Let `F` be the selected difficulty multiplier.

## Base Gold

Gold grows faster than duration so larger commitments carry meaningful
economic weight:

$$
G_0 = 40D^{1.2}F
$$

For a Normal quest:

| Planned duration | Base Gold |
| ---: | ---: |
| 1 day | 40 |
| 3 days | 149 |
| 5 days | 276 |
| 7 days | 413 |
| 14 days | 949 |
| 30 days | 2,369 |

## Base XP

XP grows logarithmically so an extremely long quest cannot generate
proportionally extreme progression:

$$
X_0 = 70\ln(1+D)F^{0.85}
$$

For a Normal quest:

| Planned duration | Base XP |
| ---: | ---: |
| 1 day | 49 |
| 3 days | 97 |
| 5 days | 125 |
| 7 days | 146 |
| 14 days | 190 |
| 30 days | 240 |
| 60 days | 288 |

Gold continues to accelerate while XP increases more slowly. This makes large
quests economically valuable without making them the dominant leveling
strategy.

## Timing Multipliers

### Early Completion

For a quest completed early, define the saved fraction:

$$
s = \frac{D-A}{D}
$$

Then calculate:

$$
M_G = 1 + 0.60\frac{e^{1.2s}-1}{e^{1.2}-1}
$$

Clamp `s` to the range `[0, 1]`. The maximum early bonus is therefore 60%
Gold.

For a 7-day Normal quest with 413 base Gold:

| Completed in | Gold multiplier | Final Gold |
| ---: | ---: | ---: |
| 7 days | 1.000 | 413 |
| 6 days | 1.048 | 433 |
| 5 days | 1.106 | 457 |
| 4 days | 1.174 | 485 |
| 3 days | 1.255 | 518 |
| 1 day | 1.465 | 605 |

A quest planned for 7 days and completed in 4 days awards approximately 413
base Gold plus a 72 Gold speed bonus, for 485 Gold total.

### Late Completion

For a late quest, define lateness relative to the original duration:

$$
l = \frac{A-D}{D}
$$

Then calculate:

$$
M_G = \max\left(0.35, e^{-1.4l^{1.35}}\right)
$$

The 35% floor ensures finishing remains worthwhile even when a quest is very
late.

For the same 7-day Normal quest:

| Completed in | Gold multiplier | Final Gold |
| ---: | ---: | ---: |
| 7 days | 100% | 413 |
| 8 days | 90% | 373 |
| 10 days | 64% | 264 |
| 12 days | 41% | 170 |
| 14 or more days | 35% floor | 145 |

## XP Timing

XP receives a softer timing adjustment because a late completion still
represents learning and effort.

For early completion:

$$
M_X = 1 + 0.5(M_G-1)
$$

The maximum early XP bonus is 30%.

For late completion:

$$
M_X = \max(0.70, M_G^{0.35})
$$

Late XP never falls below 70% of base XP.

For a 7-day Normal quest with 146 base XP:

| Completed in | Final Gold | Final XP |
| ---: | ---: | ---: |
| 4 days | 485 | 159 |
| 7 days | 413 | 146 |
| 8 days | 373 | 141 |
| 10 days | 264 | 125 |
| 14 days | 145 | about 102 |

## Final Reward Equations

```text
Base Gold = 40 * D^1.2 * F
Base XP   = 70 * ln(1 + D) * F^0.85

Final Gold = Base Gold * Gold timing multiplier
Final XP   = Base XP * XP timing multiplier
```

The backend calculates and stores all reward values. The client only sends
quest intent and displays the resulting server-authored reward snapshot.

## Character Levels

The XP required for each next level increases by approximately 12%:

$$
XP_{next} = 100(1.12)^{Level-1}
$$

| Current level | XP for next level |
| ---: | ---: |
| 1 | 100 |
| 5 | 157 |
| 10 | 277 |
| 20 | 861 |
| 30 | 2,675 |
| 40 | 8,308 |
| 50 | 25,804 |

Early levels arrive quickly while later levels remain meaningful long-term
achievements.

## Skill And Attribute Growth

A quest distributes its final XP across weighted skills. Weights must be
non-negative and total exactly 100%.

Example:

```text
Quest XP: 160

Coding       60% -> 96 skill XP
Creativity   20% -> 32 skill XP
Discipline   20% -> 32 skill XP
```

Raw skill XP is persistent. The displayed stat uses exponential saturation:

$$
Stat = 100(1-e^{-SkillXP/5000})
$$

| Skill XP | Displayed stat |
| ---: | ---: |
| 500 | 10 |
| 1,000 | 18 |
| 2,500 | 39 |
| 5,000 | 63 |
| 10,000 | 86 |
| 15,000 | 95 |
| 20,000 | 98 |

This makes early improvement visible while keeping very high mastery rare.

## Worked Example

```text
Quest: Build Life RPG website
Difficulty: Hard (F = 1.30)
Planned duration: 7 days

Coding       50%
Design       25%
Discipline   25%
```

Base rewards:

```text
Gold = 413 * 1.30 = 537
XP   = 146 * 1.30^0.85 = about 182
```

When completed in 4 days, the Gold multiplier is approximately `1.174`:

```text
Base Gold        537
Speed bonus       93
Final Gold       630

Base XP          182
Efficiency XP     16
Final XP         198

Coding XP         99
Design XP         50
Discipline XP     49
```

## Anti-Exploit Rules

1. Lock the original deadline when the quest starts.
2. Lock difficulty and skill weights when the quest starts.
3. Cap early rewards at 160% Gold and 130% XP.
4. Floor late rewards at 35% Gold and 70% XP.
5. Convert goals longer than 30 days into campaigns with milestones.
6. Award no Gold for abandoned quests. Completed milestones may retain
   partial XP.
7. Never allow Gold to buy XP, levels, or character stats directly.
8. Calculate durations and rewards on the backend from trusted timestamps.
9. Persist the final reward inputs, multipliers, and outputs as an immutable
   completion snapshot.

## Campaigns

A campaign represents a large goal and breaks it into milestone quests rather
than allowing one oversized quest:

```text
Campaign: Build Life RPG

Backend architecture  3 days
Authentication        2 days
Quest system          4 days
XP economy            3 days
Character UI          4 days
Analytics             3 days
Production release    5 days
```

Each quest grants its own rewards. Completing the whole campaign may grant:

- 20% bonus campaign Gold.
- 10% bonus campaign XP.
- A unique title.
- An achievement.
- A cosmetic unlock.

Campaign rewards must be granted exactly once from completed milestone
snapshots, not recalculated from editable client data.

## Gold Sinks And Reward Shop

Gold needs meaningful uses that do not manufacture progression.

Suggested system rewards:

| Cost | Example reward |
| ---: | --- |
| 100 Gold | Small reward |
| 250 Gold | One hour of guilt-free gaming |
| 400 Gold | Movie or entertainment reward |
| 500 Gold | Streak Shield |
| 750 Gold | Rare avatar item |
| 1,000 Gold | Major personal reward |
| 2,500 Gold | Epic cosmetic or achievement item |

Users may also define personal real-life rewards:

```text
Order pizza   700 Gold
Buy a game  4,000 Gold
Weekend trip 12,000 Gold
```

All prices are server-owned at purchase time, and every purchase must be
transactional and exactly once.

## Economy Loop

```text
Quest plan
  -> locked duration, difficulty, and skill weights
  -> completion timing
  -> Gold and XP rewards
  -> Gold funds the reward shop
  -> XP advances character levels
  -> weighted skill XP advances character stats
  -> increasingly difficult long-term mastery
```

## Decisions Required Before Implementation

- Map the proposed six difficulties to the current quest difficulty enum, or
  migrate the enum.
- Define the minimum allowed planned duration and timestamp rounding rules.
- Choose one deterministic whole-number rounding rule for rewards and skill XP.
- Define when a quest becomes started and which edits remain legal afterward.
- Decide whether campaigns are limited to 30 days or whether each milestone is
  limited instead.
- Specify abandonment and partial-milestone XP behavior.
- Decide which real-life rewards require user confirmation or redemption logs.

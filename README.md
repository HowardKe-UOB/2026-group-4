<div align="center">

# 🌊 2026-group-4

### 2026 COMSM0166 group 4

[![p5.js](https://img.shields.io/badge/p5.js-ED225D?style=for-the-badge&logo=p5.js&logoColor=white)](https://p5js.org/)

[**🎮 Click this link to play our game 🎮**](https://uob-comsm0166.github.io/2026-group-4/)

_Figure 1: The initial game screen of Deep Sea Prospector, showing the mode selection interface (Shallow Water / Deep Sea) and the submarine-themed visual style._

<img src="docs/assets/deepsea_prospector.png" alt="Game initial input page background" width="800">

<br>

**[📋 Group Kanban Board](https://github.com/orgs/UoB-COMSM0166/projects/158)**

</div>

---

## 📑 Table of Contents

1. [Development Team](#1-development-team)
2. [Introduction](#2-introduction)
3. [Requirements](#3-requirements)
4. [Design](#4-design)
5. [Implementation](#5-implementation)
6. [Evaluation](#6-evaluation)
7. [Sustainability](#7-sustainability)
8. [Process](#8-process)
9. [Conclusion](#9-conclusion)
10. [Contribution Statement](#10-contribution-statement)
11. [Appendix](#11-appendix)
12. [References](#12-references)

---

<a id="1-development-team"></a>

## 👨‍💻 1. Development Team

_Figure 2: Group 4 development team members._

<div align="center">
  <img src="./GROUP4.png" alt="group picture" width="600">
</div>

<div align="center">

| Name            | Email                 | Github                                                    | Role |
| :-------------- | :-------------------- | :-------------------------------------------------------- | :--- |
| **Weikai Mao**  | uz25020@bristol.ac.uk | [M1yanoShiho](https://github.com/M1yanoShiho)             | -    |
| **Zenan Wu**    | jp25459@bristol.ac.uk | [zenanwu479-glitch](https://github.com/zenanwu479-glitch) | -    |
| **Jianxing Li** | ue25937@bristol.ac.uk | [UoB26Git](https://github.com/UoB26Git)                   | -    |
| **Bingyu Ke**   | wp25446@bristol.ac.uk | [Howard Ke](https://github.com/HowardKe-UOB)              | -    |
| **Zeyu Guo**    | rp23254@bristol.ac.uk | [bytevostg](https://github.com/bytevostg)                 | -    |

</div>

---

<a id="2-introduction"></a>

## 🚀 2. Introduction

A project template for the Software Engineering Discipline and Practice module (COMSM0166).

### ℹ️ Info

This is the template for your group project repo/report. We'll be setting up your repo and assigning you to it after the group forming activity. You can delete this info section, but please keep the rest of the repo structure intact.

You will be developing your game using [P5.js](https://p5js.org) a javascript library that provides you will all the tools you need to make your game. However, we won't be teaching you javascript, this is a chance for you and your team to learn a (friendly) new language and framework quickly, something you will almost certainly have to do with your summer project and in future. There is a lot of documentation online, you can start with:

- [P5.js tutorials](https://p5js.org/tutorials/)
- [Coding Train P5.js](https://thecodingtrain.com/tracks/code-programming-with-p5-js) course - go here for enthusiastic video tutorials from Dan Shiffman (recommended!)

#### 🎬 Paper Prototype Video

<div align="center">

**Paper Prototype of Deep Sea Prospector**
<br><br>
<video src="https://github.com/user-attachments/assets/fca9d025-2279-4b16-b439-3e32f4e623b9" controls width="600"></video>

</div>

Our initial motivation was to create a game with simple controls and an immediately responsive feedback loop, drawing inspiration from classic titles such as "Gold Miner". Building on these influences, we framed our core experience around intuitive interaction and instant feedback, using these principles as the foundation for our subsequent design decisions and prototype iterations.

The paper prototyping phase allowed us to visualize the gameplay flow and refine the structured risk-reward loop. By stepping through the mechanics manually, we confirmed that the combination of precise aiming, strategic timing, and resource collection provided a compelling sense of progression. Feedback from peer groups further validated that this direction offered a clear purpose and satisfying player agency. Consequently, we focused our development on "Deep Sea Prospector," prioritizing a compact control scheme, tactile feedback, and the engaging collect-and-upgrade loop that defines the final experience.

### 🎮 Your Game (change to title of your game)

STRAPLINE. Add an exciting one sentence description of your game here.

IMAGE. Add an image of your game here, keep this updated with a snapshot of your latest development.

LINK. Add a link here to your deployed game, you can also make the image above link to your game if you wish. Your game lives in the `/docs` folder, and is published using Github pages.

VIDEO. Include a demo video of your game here (you don't have to wait until the end, you can insert a work in progress video)

### 📝 Report Guidance

- 5% ~250 words
- Describe your game, what is based on, what makes it novel? (what's the "twist"?)

---

<a id="3-requirements"></a>

## 📋 3. Requirements

### 3.1 Stakeholder table

| Stakeholder                 | Epic                        | User Story                                                                                                                                           | Acceptance Criteria                                                                                                                                                                                                   |
| :-------------------------- | :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User: Casual Player**     | Core Fishing Mechanics      | "As a casual player, I want to control the hook using a single key press, so that I can easily catch fish without learning complex controls."        | **Given** the hook is swinging back and forth,<br>**When** I press the 'Down Arrow Key',<br>**Then** the hook should stop swinging and extend in a straight line.                                                     |
| **User: Challenge Seeker**  | Dynamic Ecosystem & Hazards | "As a challenge seeker, I want sharks to patrol the water and eat my catch, so that the game feels risky and exciting."                              | **Given** I am reeling in a captured fish,<br>**When** the shark's body collides with my fish,<br>**Then** the fish should be destroyed and I should earn $0.                                                         |
| **User: Strategic Player**  | Dynamic Ecosystem & Hazards | "As a strategic player, I want ocean currents to affect the swimming speed of fish, so that I must predict their movement before launching my hook." | **Given** bubbles show the current is flowing to the Right,<br>**When** a fish swims to the Right (with the current),<br>**Then** its movement speed should increase by 50% compared to swimming against the current. |
| **User: Progression Gamer** | Economy & Progression Loop  | "As a progression-focused gamer, I want to buy upgrades in a shop between levels, so that I can handle increasing difficulty."                       | **Given** I am in the shop screen with 500 gold,<br>**When** I click the 'Buy Laser Sight' button,<br>**Then** 500 gold is deducted and a trajectory line appears in the next level.                                  |
| **User: Developer**         | Core Fishing Mechanics      | "As a developer, I want a collision detection system, so that the hook recognizes when it hits an object versus empty water."                        | **Given** the hook is extending,<br>**When** the hook collider touches a 'Rock' object,<br>**Then** the hook should stop extending and immediately begin retracting.                                                  |
| **User: Artist**            | Visual Feedback & Immersion | "As an artist, I want distinct animations for different fish states, so that the player gets visual feedback on their actions."                      | **Given** a fish is idle swimming,<br>**When** the hook grabs the fish,<br>**Then** the fish sprite should switch to a 'struggling' animation.                                                                        |

### 3.2 Reflection

**1.** In the development project of this fishing game (Deep Sea Prospector), Value vs Effort Matrix is often considered to scientifically schedule the development sequence of tasks/functions. Avoid blindly investing and wasting resources on low value, high effort tasks such as complex 3D backgrounds. Ensure the smooth completion of software development.

**2.** Determine user acceptance criteria:

- **a.** Is the fish hook used by the player swinging evenly at a constant speed. When the player clicks the mouse, the hook should launch immediately without delay.
- **b.** When players choose the slightly difficult "deep sea" mode, ocean currents, as the "x factor" in the sea, can change the movement trajectory of various fish. Another 'x factor' shark can damage ordinary fish hooks.
- **c.** Before the countdown ends, the total value of all items captured must be equal to or greater than the target amount required for this level.
- **d.** ✅ **Pass:** Score up to standard → Proceed to the next level/enter the mall to purchase equipment. <br> ❌ **Fail:** Score not met or time is up → Challenge this level again.
- **e.** Special objective: Capture mobile golden koi purchased through the mall within a limited time and complete the capture.

**3.** We not only include players, but also developers and UI designers in the identification of stakeholders. This makes us realize that demand cannot be driven solely by user experience, but also requires a balance between technical feasibility and the quality of artistic implementation.

### 3.3 Prioritised Feature Breakdown

A risk-managed development roadmap prioritising the core hook mechanic and level progression before advanced systems and multiplayer features.

- **HIGH:** Realize the basic functions of the game
- **MEDIUM:** Enhance the depth of gameplay
- **LOW:** Extra point

| **Priority**            | **Systems / Features**                                                      | **Estimated Implementation Time** |
| :---------------------- | :-------------------------------------------------------------------------- | :-------------------------------- |
| **HIGH (MVP)**          | Hook Oscillation & Launch Mechanic (pivot rotation, trigger, reeling logic) | 2–3 days                          |
|                         | Object Detection & Collision System (fish, treasure, rocks hitboxes)        | 2–3 days                          |
|                         | Weight-Based Reeling Speed (heavier objects reel slower)                    | 1–2 days                          |
|                         | Time-Based Level Goal (quota + countdown timer)                             | 1–2 days                          |
|                         | Core Level Loop (start → play → results screen → next level)                | 1–2 days                          |
|                         | Basic Fish Types (common, rare, moving patterns)                            | 1–2 days                          |
|                         | UI System (timer, money counter, quota display)                             | 2–3 days                          |
|                         | Ranking List (local leaderboard system)                                     | 2+ days                           |
| **MEDIUM (Core Depth)** | Basic Obstacles (volcanic rocks blocking hook)                              | 1–2 days                          |
|                         | Shark Interception System (fish eaten while reeling)                        | 2–3 days                          |
|                         | Shop System (purchase upgrades & consumables)                               | 2–3 days                          |
|                         | Item: Rare Fish Bait (spawns Golden Koi next level)                         | 2+ days                           |
|                         | Item: Laser Sight Upgrade (trajectory visualization)                        | 2+ days                           |
|                         | Reinforced Claw (retrieve huge objects)                                     | 2+ days                           |
|                         | Massive Obstacle (requires Reinforced Claw)                                 | 2–4 days                          |
|                         | Ocean Current System                                                        | 2–3 days                          |
|                         | Shallow vs Deep Water Zones (affecting claw retrieval speed)                | 2–3 days                          |
|                         | Audio Feedback System (hook launch, catch, shark bite, shop)                | 2–3 days                          |
| **LOW (Stretch)**       | Advanced Fish Behaviours (e.g., fast dash patterns)                         | 2+ days                           |
|                         | Two-Player Mode (dual hook setup)                                           | 4+ days                           |
|                         | Procedural Level Variations (object distribution randomizer)                | 2–4 days                          |
|                         | Visual Effects Polish (water distortion, glow, particle effects)            | 3+ days                           |

### 📝 Report Guidance

- 15% ~750 words
- Early stages design. Ideation process. How did you decide as a team what to develop? Use case diagrams, user stories.

---

<a id="4-design"></a>

## 📐 4. Design

### 4.1 System Architecture Overview

Deep Sea Prospector employs a modular object-oriented architecture with clearly defined responsibilities, adhering to the Single Responsibility Principle and emphasizing high cohesion and low coupling for maintainability and extensibility. The architecture separates concerns into distinct layers: game state management, level logic, player data, and gameplay mechanics.

Core components include:

- **GameManager** — Central controller coordinating all subsystems and managing game flow transitions between states (title screen, gameplay, shop, results)
- **LevelManager** — Handles level configuration, target scores, time limits, difficulty parameters, and dynamic sea creature spawning
- **Player** — Manages player progression including gold currency, purchased upgrades, and input responses
- **Hook** — Implements core gameplay mechanics: swinging, launching, collision detection, item grabbing, and retrieval with weight-based physics
- **SeaItems** — Abstract base class providing unified interface for all catchable items (fish, treasures, obstacles) with polymorphic behavior

### 4.2 Class Diagram

_Figure 3: Class diagram showing the object-oriented structure of Deep Sea Prospector._

<div align="center">
  <img src="progress/week5/ClassDiagram.png" alt="Class Diagram" width="800">
</div>

The class diagram illustrates core relationships and dependencies: GameManager coordinates all components (LevelManager, Player, Hook) and maintains game state consistency; LevelManager spawns and manages various SeaItems subclasses (SmallFish, BigFish, Treasure, ImaginaryFish) based on difficulty settings; Hook interacts with TargetItem to implement the capture and retrieval mechanism with physics-based weight calculations; SeaItems defines common interfaces (display, move, onCollision) with concrete subclasses implementing specific behaviors through inheritance and polymorphism; Player tracks progression data including current level, accumulated gold, and purchased upgrades that modify gameplay mechanics.

### 4.3 Sequence Diagrams

#### 4.3.1 Game Initialization and Level Start

_Figure 4: Sequence diagram illustrating the game initialization flow from difficulty selection to level start._

<div align="center">
  <img src="progress/week5/SequenceDiagram1.png" alt="Sequence Diagram 1 - Game Start" width="800">
</div>

This sequence diagram demonstrates the flow from game startup to level commencement: Player selects difficulty at the title screen; GameManager transitions to PLAYING state; LevelManager initializes level parameters (target score, time limit) based on difficulty; timer and score reset; Hook enters IDLE state and begins swinging awaiting input; SeaItems spawns sea creatures and treasures according to configuration; game loop begins.

#### 4.3.2 Hook Capture Mechanism

_Figure 5: Sequence diagram showing the hook deployment, collision detection, and item retrieval process._

<div align="center">
  <img src="progress/week5/SequenceDiagram2.png" alt="Sequence Diagram 2 - Hook Capture" width="800">
</div>

This sequence diagram details the hook capture mechanism: Player presses down arrow; LevelManager invokes Hook's `deployDown()`; Hook transitions to MOVING_DOWN state and descends via `move()` in each frame; continuous collision detection with TargetItem triggers grabbing when `onCollision()` returns true; Hook calls `grabItem()` and transitions to MOVING_UP; during retrieval, Hook adjusts ascent speed based on item weight while calling `moveWithItem()`; upon reaching boat position, Hook calls `returnComplete()` to notify TargetItem; LevelManager adds item value to score; Hook resets to IDLE_SWINGING state; TargetItem calls `destroy()` to remove from scene.

#### 4.3.3 Level Completion and Result Evaluation

_Figure 6: Sequence diagram depicting the level end condition checking and result screen transition._

<div align="center">
  <img src="progress/week5/SequenceDiagram3.png" alt="Sequence Diagram 3 - Level End" width="800">
</div>

This sequence diagram illustrates level completion logic: Game loop calls LevelManager's `updateDeltaTime()` each frame to update remaining time; when `timeRemaining <= 0`, level end check triggers; LevelManager calls `checkWinCondition()` to compare current score against target; if successful, calls `reportLevelResult(SUCCESS)` and GameManager displays completion screen; if failed, calls `reportLevelResult(FAILURE)` and displays failure screen; GameManager calls `changeState(LEVEL_RESULT)` to switch to results state, awaiting player choice to continue or return to menu.

### 4.4 Design Patterns and Principles

Our architecture applies key design patterns: **State Pattern** for GameManager's flow control (TITLE, PLAYING, SHOP, LEVEL_RESULT) and Hook's behavior states (IDLE_SWINGING, MOVING_DOWN, MOVING_UP); **Factory Pattern** for LevelManager's dynamic SeaItems creation; **Inheritance Hierarchy** with SeaItems as base class for SmallFish, BigFish, Treasure, and ImaginaryFish; **Single Responsibility Principle** ensuring each class has focused functionality; **Observer Pattern** enabling loose coupling between Hook and TargetItem via event callbacks (onCollision, returnComplete). This modular design facilitates easy extension of new features and independent testing of components.

### 📝 Report Guidance

- 15% ~750 words
- System architecture. Class diagrams, behavioural diagrams.

---

<a id="5-implementation"></a>

## 💻 5. Implementation

Each challenge below uses **short code excerpts** from our repo (labeled **Figure A–I**) so you can see how each behaviour is implemented without pasting whole files. For coursework that wants **figures**, screenshot the same lines in your IDE, save PNGs under e.g. `docs/assets/implementation/`, and add `<img src="docs/assets/implementation/your-shot.png" alt="Implementation excerpt" width="720">` beside the matching figure.

### 5.1 Overview

**What we built with.** We use [P5.js](https://p5js.org/) so the game runs in the browser with straightforward drawing, sound, and input. The live version is published from the `docs/` folder: one main script wires up the frame loop and keyboard, and separate modules handle menus, each level, the hook, sea creatures, the shop, and scores. That separation mattered to us because the game mixes many modes (menus, fishing, shop, results); keeping responsibilities split made it easier to debug and to add features without breaking the whole loop.

**Why these three challenges.** Implementation was not just “drawing sprites”—we had to make the *feel* of the game believable, keep *difficulty and rewards* from drifting out of balance as levels advanced, and give players a reason to care about *other people’s runs* without slowing the site down. In plain terms:

- **Challenge 1 — The hook and the sea.** Players judge the game on whether casting and reeling feel fair. We had to model swing, drop, hits, and reel-up so catches register when they should (not when they frustratingly miss), heavy loot feels heavy, and deep-sea extras (dark water, sharks) add tension rather than cheap failures.

- **Challenge 2 — Progression and economy.** As levels go up, the score target and the timer need to stay in a sensible relationship, and shop prices need to grow with that pressure so upgrades remain tempting but not automatic. We also tuned how much each species is worth so risky catches feel rewarding without breaking easier levels.

- **Challenge 3 — Leaderboard and fish “dex”.** We wanted shared high scores and a collection-style view of which fish each run caught (similar to filling a Pokédex). The design tension was **motivation vs performance**: sending full images for every fish on every row would be slow and expensive, so we only store **counts per fish type** in the database and let the game **reuse artwork it already loaded** to paint the gallery.

The subsections below walk through how we addressed each area in code, still anchored in the files under `docs/js/`, but starting from *why* a choice existed before naming the mechanism.

### 5.2 Challenge 1: Making the hook, collisions, and deep sea feel fair

**Swing, cast, and reel as clear phases.** The hook is not a single animation—it behaves like three steps players can reason about: swinging at the surface, shooting straight down when they press the key, then coming back up with or without a catch. In code we track those phases explicitly so the same object never tries to “swing” and “reel” at once. While swinging, the tip traces an arc from the boat; once fired, the rope lengthens until it hits something or leaves the play area; on the way up, heavier catches slow the climb so risk matches reward.

_Figure A (excerpt): swing geometry — `Hook.js`_

```javascript
// Core idea: angle drives the arc; rope length grows while dropping (Hook.js)
this.angle =
    (sin(frameCount * this.angleVel * this.swingSpeedMultiplier) * PI) / 3;
this.position.x = this.origin.x + sin(this.angle) * this.length;
this.position.y = this.origin.y + cos(this.angle) * this.length;
```

**Hits that players can trust.** We detect catches by measuring distance between the hook tip and each creature or object, with a little extra leniency so a near-miss still feels like a hit. Different objects deliberately use different “hit bubbles”: a big fish might look large but use a slightly stricter zone so mastery matters; a pearl can be tiny and valuable so only precise drops succeed. When the level is built, we also nudge obstacles and treasures apart so they do not spawn stacked on top of each other.

_Figure B (excerpt): collision while dropping — `LevelManager.js`_

```javascript
if (currentHook.state === HookState.MOVING_DOWN) {
    for (let j = this.activeItems.length - 1; j >= 0; j--) {
        let item = this.activeItems[j];
        let d = dist(
            currentHook.position.x,
            currentHook.position.y,
            item.position.x,
            item.position.y,
        );
        if (d < (item.catchRadius ?? item.width / 2) + 10) {
            if (item.canBeCaught) {
                currentHook.grabItem(item);
                this.activeItems.splice(j, 1);
                break;
            }
        }
    }
}
```

**Reeling and shop upgrades.** Heavier items subtract from the upward speed (with a minimum so the hook never gets stuck), and shop purchases can speed the reel again—so preparation before a hard level is tangible in the controls.

_Figure C (excerpt): weight and upgrades on the way up — `Hook.js`_

```javascript
} else if (this.state === HookState.MOVING_UP) {
    let originalSpeed = this.attachedItem
        ? max(1, this.moveSpeed - this.attachedItem.weight)
        : this.moveSpeed;
    let currentSpeed = originalSpeed * (this.retractMultiplier || 1);
    this.length -= currentSpeed;
    // …tip position + dragging the attached sprite…
}
```

**Deep sea as a rules layer.** After the player buys the submarine, runs switch to a darker scene: we draw a mask so only a cone of light is visible, and sharks appear on a rhythm of their own. If a shark crosses the catch on the way up, the fish can be lost. That is difficult by design, but it is a separate layer from the basic hook logic, which keeps shallow water simple while deep water adds spectacle and risk.

### 5.3 Challenge 2: Level targets, shop prices, and how much each catch is worth

**Rationale.** If every level used a fixed target or a hand-typed number, we would constantly be guessing whether hard mode or two-player felt impossible. We wanted one **consistent recipe** that: (a) asks for more score as levels advance, (b) respects how much time the player gets that level, and (c) bumps requirements for hard mode and for two people sharing the sea.

**What we actually compute.** For each level index we combine a time budget (shorter pressure on hard mode), a gentle “player is getting better” factor, and a small density factor so later tiers do not plateau. Those pieces are summed across all levels reached so far, rounded to tidy scores, then **hard mode** and **two-player** apply separate multipliers everyone can reason about (roughly “hard asks more,” “two players must earn more together”). The **same time budget** also drives the countdown, so the number you are chasing and the clock you are watching stay in sync—otherwise the game would feel arbitrary.

**Shop.** Item prices start from a base cost and **inflate with level** (with occasional sales), so the shop does not become irrelevant just because targets went up. Laser sight, faster reel, and other tools stay part of the strategy instead of early-game-only toys.

**Fish and treasures.** Small fish are common fillers; big fish and deep-sea anglerfish pay more but fight the reel; treasures and pearls sit at the high end with different shapes and hit sizes so reading the seabed matters. All of those numbers live in code as plain ranges we adjusted after playtests and the usability study in Section 6.

_Figure D (excerpt): cumulative target from time + growth, then mode multipliers — `LevelManager.js` (constructor)_

```javascript
const goldFishEff = 26.67;
let totalTarget = 0;
for (let i = 1; i <= n; i++) {
    let stdTime =
        this.difficulty === Difficulty.HARD
            ? Math.min(35, 24 + i)
            : Math.min(40, 29 + i);
    let factorLevel = Math.min(i, 10);
    let skillFactor = 0.5 + (factorLevel - 1) * (0.4 / 9);
    let growthFactor = 1 + (factorLevel - 1) * 0.05;
    totalTarget += stdTime * goldFishEff * skillFactor * growthFactor;
}
if (this.difficulty === Difficulty.HARD) totalTarget *= 1.2;
if (this.playerMode === PlayerMode.TWO_PLAYER) totalTarget *= 1.75;
this.targetScore = Math.floor(totalTarget / 10) * 10;
```

_Figure E (excerpt): level-scaled shop price — `ShopItem.js`_

```javascript
let inflationRate = 0.10; // per-item tweaks for Laser, Submarine, etc.
let inflationLevel = Math.min(levelNum, 11);
let multiplier = 1 + (inflationLevel - 1) * inflationRate;
let currentPrice = Math.floor(basePrice * multiplier);
if (this.name !== "Submarine" && Math.random() <= 0.1) {
    this.isDiscounted = true;
    currentPrice *= 0.5;
}
this.costPrice = Math.floor(currentPrice);
```

_The real `ShopItem` constructor sets `inflationRate` per product (e.g. laser vs submarine) before this block; this excerpt shows the level-scaling and sale idea only._

### 5.4 Challenge 3: Shared leaderboard and fish gallery without bloating downloads

**Rationale.** Competing on score is more fun when the table is real for everyone, not only on one machine. Showing *which species someone caught* adds a collector’s goal beyond raw points. The pitfall is technical: a leaderboard row could try to ship dozens of images—bad for mobile users and for our free hosting. Our answer was to treat the cloud as a **small facts sheet** (name, score, mode, and **how many of each fish type**) and keep every **picture** bundled with the game once, loaded at startup.

**What gets stored.** Each finished run stores the usual headline fields plus a **catch history**: for each fish type id, how many times it was caught that run—integers only, no image data. Locally we cache scores in the browser; on the live site we sync the same JSON-shaped row to Supabase so everyone sees one table.

**How the gallery works.** When you open a player’s fish grid, the game looks up those counts, dims species they never caught, and shows a total next to the ones they did. The portraits come from the same art the gameplay already uses (small fish sheet, big fish sheet, special sprites), so **opening a row does not trigger dozens of new downloads**—only the tiny score record did.

**Why that mattered to us.** Players get social proof and a “collection” moment; we keep the implementation maintainable and the page responsive; markers and future teammates can read the data model without hunting through binary files.

_Figure F (excerpt): turn each catch into a stable id for the dex — `LevelManager.js`_

```javascript
let key = returnedItem.itemName || "Unknown";
if (returnedItem.itemName === "Small Fish" && returnedItem.fishIndex != null) {
    key = `fish${returnedItem.fishIndex + 1}`; // fish1 … fish43
} else if (returnedItem.itemName === "Big Fish" && returnedItem.fishIndex != null) {
    key = `fish${44 + returnedItem.fishIndex}`; // fish44 … fish64
}
this.fishCaught[key] = (this.fishCaught[key] || 0) + 1;
```

_Figure G (excerpt): send one small JSON row to the cloud (counts, not images) — `HighScoreManager.js`_

```javascript
await fetch(`${cfg.url}/rest/v1/scores`, {
    method: "POST",
    headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        player_name: name,
        score: score,
        levels_completed: levelsCompleted,
        difficulty: d,
        player_mode: p,
        catch_history: ch,
        per_level_earned: ple,
        per_level_spawn_value: pls,
    }),
});
```

_Figure H (excerpt): each gallery slot knows its `key` and which preloaded sprite to draw — `GameManager.js`_

```javascript
list.push({
    key: `fish${i}`,
    label: names ? names.en : `Fish ${i}`,
    getImg: () =>
        typeof imgSmallFishes !== "undefined" && imgSmallFishes[idx]
            ? imgSmallFishes[idx][0]
            : null,
});
```

_Figure I (excerpt): gallery UI from counts only — `GameManager.js` (`drawFishGallery`)_

```javascript
const count = catchHistory[t.key] || 0;
const caught = count > 0;
if (caught) text(`×${count}`, cx, cy + 22);
else text("?", cx, cy + 22);
```

### 📝 Report Guidance

- 15% ~750 words
- Describe implementation of your game, in particular highlighting the TWO areas of _technical challenge_ in developing your game.

---

<a id="6-evaluation"></a>

## 📊 6. Evaluation

### 6.1 Qualitative Evaluation

#### Table - Heuristic Evaluation

| Interface             | Issue                                                                                                                       | Heuristic(s)                    | Frequency (0–4) | Impact (0–4) | Persistence (0–4) | Severity = (F + I + P) / 3 |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :------------------------------ | :-------------: | :----------: | :---------------: | :------------------------: |
| **Game Introduction** | There is no game introduction or tutorial screen, making it unclear how the game mechanics and items work.                  | Help and documentation          |        3        |      3       |         3         |          **3.00**          |
| **Game UI**           | The font color of the current score and remaining time is too similar to the background, reducing readability.              | Aesthetic and minimalist design |        3        |      2       |         3         |          **2.67**          |
| **Feedback System**   | After catching a fish, the value of the fish is not displayed, so players cannot immediately understand the reward gained.  | Visibility of system status     |        3        |      2       |         3         |          **2.67**          |
| **Level Progression** | The interface does not show which level the player is currently in, causing confusion about progression.                    | Visibility of system status     |        2        |      2       |         3         |          **2.33**          |
| **Controls**          | There is no pause function, so players cannot temporarily stop the game when needed.                                        | User control and freedom        |        2        |      2       |         3         |          **2.33**          |
| **Game Objects**      | Some sea creatures look similar in color and shape, making it difficult to distinguish their value or function.             | Consistency and standards       |        2        |      2       |         2         |          **2.00**          |
| **Rules Clarity**     | The special items (e.g., bombs or bonus items) lack clear visual explanation, leading to misunderstanding of their effects. | Recognition rather than recall  |        2        |      2       |         2         |          **2.00**          |
| **Feedback System**   | Audio feedback is subtle, reducing perceived reward when catching rare fish.                                                | Aesthetic and minimalist design |        1        |      2       |         2         |          **1.67**          |
| **End Game Feedback** | The game over screen does not clearly summarize performance (e.g., total score breakdown or level reached).                 | Visibility of system status     |        2        |      2       |         2         |          **2.00**          |
| **Multiplayer**       | In two-player mode, it is unclear which hook belongs to which player.                                                       | Consistency and standards       |        2        |      2       |         2         |          **2.00**          |

### 6.2 Quantitative Evaluation

We evaluated usability quantitatively, using two well-established, validated questionnaires and statistical analyses, to ensure the game was both sufficiently challenging and easy to use.

- **Raw NASA TLX** — to measure perceived workload
- **System Usability Scale (SUS)** — to test system usability quantitatively
- **Wilcoxon Signed-Rank Test** — to estimate the statistical significance of the evaluations

#### Process

These evaluations involved 10 participants, each trialing two difficulty modes. Initially, participants struggled to understand the control key of the gameplay, urging us to add short documentation.

#### Raw NASA TLX

**Subscale Workload Scores**

Across all six subscales, the median scores for all participants illustrated a tiny increase with the variance in the level of difficulty (Table 1). The change in median scores only varies slightly.

_Table 1: Median NASA TLX subscale scores for all participants_

| Scale                          | Median (easy) | Median (Deep Sea) | Δ Median |
| :----------------------------- | :-----------: | :---------------: | :------: |
| Mental Demand                  |      11       |        20         |    9     |
| Physical Demand                |      12       |        14         |    2     |
| Temporal Demand                |      25       |        30         |    5     |
| Frustration                    |      45       |        50         |    5     |
| Effort                         |      35       |        45         |    10    |
| Performance                    |      85       |        88         |    3     |
| **Overall Perceived Workload** |    **36**     |      **38**       |  **2**   |

> _Brief analysis: All 10 participants reported slight differences in overall workload in hard mode than in Easy mode (median 38 vs 36). The increase is small and consistent across participants; the Wilcoxon test (Table 2) found no statistically significant difference, suggesting the difficulty step did not substantially raise perceived workload._

<div align="center">
  <img src="docs/evaluation report figure/overal_workload.png" alt="NASA TLX Overall Workload by Participant" width="600">
</div>

**Statistical Analysis**

A Wilcoxon Signed-Rank test was performed for each subscale and for overall workload (N = 10, α = 0.05, critical value = 8). As shown in Table 2, the W statistic exceeded the critical value for all seven scales, indicating that the increase in difficulty did not produce a statistically significant difference in perceived workload at either the subscale or overall level.

_Table 2: Wilcoxon Signed-Rank Test Results (N = 10, α = 0.05, critical value = 8)_

| Scale                | W Statistic | Critical Value | Significant? |
| :------------------- | :---------: | :------------: | :----------: |
| Mental Demand        |     12      |       8        |      No      |
| Physical Demand      |     15      |       8        |      No      |
| Temporal Demand      |     14      |       8        |      No      |
| Frustration          |     16      |       8        |      No      |
| Effort               |     13      |       8        |      No      |
| Performance          |     18      |       8        |      No      |
| **Overall Workload** |   **11**    |     **8**      |    **No**    |

**Solutions and Adjustments**

To create a meaningfully harder experience in hard mode, we implemented several design changes based on the codebase:

1. **target score +30%** and **shorter time limits** (25−levelNum seconds, min 15s) to raise pressure;
2. **faster fish** (1.3–1.8× speed) to increase aiming difficulty;
3. **more obstacles** (guard stones around treasure, 8–12 loose stones in deep sea) to complicate hook paths;
4. **sharks** that steal caught items during reel-up;
5. **limited visibility** (darkness layer with only a cone of light from the submarine) to add spatial uncertainty;
6. **different fish composition** (AnglerFish about 250–400 pts, fewer but higher-value targets).

We also rebalanced the economy: **fish values** were adjusted (SmallFish 30–150→10–50, BigFish 250–600→150–350, Treasure 100–500→50–400) to better match level targets; the **shop** was changed from fixed prices to level-scaled pricing so upgrades remain attainable as difficulty rises. The NASA TLX results showed no statistically significant increase in perceived workload, suggesting these changes added challenge without overwhelming players.

#### System Usability Scale (SUS)

**Process**

After finishing the NASA-TLX evaluation, all 10 participants filled out the SUS questionnaire, a standardized tool with 10 questions to measure overall system usability (Lewis, 2018). We calculated scores following the standard SUS methodology.

**Results**

- Mean SUS score (easy) — **88.25**
- Mean SUS score (hard) — **75.0**

<div align="center">
  <img src="docs/evaluation report figure/sus_evaluation.png" alt="SUS Evaluation Results" width="600">
</div>

_Table 3: SUS evaluation results_

Based on our SUS results, all participants rated both difficulty levels above the standard usability benchmark of 68, with Shallow Water averaging 88.25 and Deep Sea averaging 75.0. These scores indicate excellent perceived usability for the easier condition and solidly above‑average usability even in the more challenging Deep Sea mode, suggesting that the game remains easy to use across difficulty levels.

**Statistical Analysis**

A Wilcoxon signed-rank test was conducted to compare SUS scores between the Shallow Water and Deep Sea conditions. For a sample size of 10 at α = 0.05, the critical value of W was 8. The obtained test statistic did not exceed this critical value, indicating no statistically significant difference in perceived usability between the two difficulty levels.

**Solutions and Adjustments**

The SUS confirmed that both difficulty levels offered strong overall usability, but it was less informative for driving concrete design changes than our qualitative observations and NASA TLX workload ratings. Instead, we used the SUS primarily as a summative check to validate that the game provided a positive user experience across conditions. We also noticed indications of questionnaire fatigue, likely because participants completed the SUS immediately after the NASA TLX, which may have reduced how carefully they responded. for the future conduction , we plan to include short breaks or separate the SUS and NASA TLX into different sessions to lower cognitive load and improve response quality.

---

<a id="7-sustainability"></a>

## 🌱 7. Sustainability

Add your sustainability discussion here.

---

<a id="8-process"></a>

## 🔄 8. Process

- 15% ~750 words
- Teamwork. How did you work together, what tools and methods did you use? Did you define team roles? Reflection on how you worked together. Be honest, we want to hear about what didn't work as well as what did work, and importantly how your team adapted throughout the project.

---

<a id="9-conclusion"></a>

## 🏁 9. Conclusion

- 10% ~500 words
- Reflect on the project as a whole. Lessons learnt. Reflect on challenges. Future work, describe both immediate next steps for your current game and also what you would potentially do if you had chance to develop a sequel.

---

<a id="10-contribution-statement"></a>

## 🤝 10. Contribution Statement

- Provide a table of everyone's contribution, which _may_ be used to weight individual grades. We expect that the contribution will be split evenly across team-members in most cases. Please let us know as soon as possible if there are any issues with teamwork as soon as they are apparent and we will do our best to help your team work harmoniously together.

---

<a id="11-appendix"></a>

## 📎 11. Appendix

Additional marks guidance:
You can delete this section in your own repo, it's just here for information. In addition to the marks above, we will be marking you on the following two points:

- **Quality** of report writing, presentation, use of figures and visual material (5% of report grade)
    - Please write in a clear concise manner suitable for an interested layperson. Write as if this repo was publicly available.

- **Documentation** of code (5% of report grade)
    - Organise your code so that it could easily be picked up by another team in the future and developed further.
    - Is your repo clearly organised? Is code well commented throughout?

---

<a id="12-references"></a>

## 📚 12. References

Add your references here.

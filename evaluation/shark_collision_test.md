# Shark Collision & Eating Behaviour — Black-Box Test Cases

## Feature Overview

In deep-sea mode (player must own the Submarine upgrade), a `Shark` periodically swims across the screen. When the shark's **head hitbox** overlaps the item currently attached to an **ascending hook** (`HookState.MOVING_UP`), the shark may "eat" (steal) the item — setting `hook.attachedItem = null`, playing the stolen sound effect, and displaying a floating "STOLEN!" label.

---

## Pre-conditions (must hold for ALL tests below)

| # | Condition |
|---|---|
| P1 | Player has purchased the **Submarine** (unlocks deep-sea mode) |
| P2 | Current level is running and game state is `PLAYING` |
| P3 | A shark is on screen (spawns every 300–480 frames) |

If any pre-condition fails, no stealing will ever occur regardless of item type.

---

## Item Types & Expected Shark Behaviour

| Item Type | Class | Can be eaten? | Expected Result on Collision |
|-----------|-------|:---:|-----|
| Small Fish | `SmallFish` | **YES** | Item stolen; hook returns empty; "STOLEN!" shown; stolen SFX plays |
| Big Fish | `BigFish` | **YES** | Same as above |
| Angler Fish | `AnglerFish` | **YES** | Same as above |
| Treasure Chest | `TreasureChest` | **YES** | Same as above |
| Pearl | `Pearl` | **YES** | Same as above |
| Stone | `Stone` | **NO** | Shark passes through; hook continues retracting with stone attached |
| Fish Bone | `FishBone` | **NO** | Shark passes through; hook continues retracting with bone attached |

---

## Black-Box Test Cases

### TC-01 — Small Fish stolen by shark

| Field | Detail |
|---|---|
| **Preconditions** | P1–P3; hook retracting with a Small Fish attached |
| **Action** | Wait for shark's head hitbox to overlap the Small Fish on the hook |
| **Expected** | Fish disappears from hook; hook returns empty; "STOLEN!" label appears; stolen SFX plays |
| **Pass Criterion** | Player receives **no score** for that fish; hook is visually empty |

---

### TC-02 — Big Fish stolen by shark

| Field | Detail |
|---|---|
| **Preconditions** | P1–P3; hook retracting with a Big Fish attached |
| **Action** | Wait for shark collision |
| **Expected** | Same stealing behaviour as TC-01 |
| **Pass Criterion** | No score awarded; hook empty |

---

### TC-03 — Angler Fish stolen by shark

| Field | Detail |
|---|---|
| **Preconditions** | P1–P3; hook retracting with an Angler Fish attached |
| **Action** | Wait for shark collision |
| **Expected** | Angler Fish removed from hook; "STOLEN!" shown |
| **Pass Criterion** | No score (400–800 pts loss); hook empty |

---

### TC-04 — Treasure Chest stolen by shark

| Field | Detail |
|---|---|
| **Preconditions** | P1–P3; hook retracting with a Treasure Chest attached |
| **Action** | Wait for shark collision |
| **Expected** | Treasure stolen; "STOLEN!" shown |
| **Pass Criterion** | No score; hook empty |

---

### TC-05 — Pearl stolen by shark

| Field | Detail |
|---|---|
| **Preconditions** | P1–P3; hook retracting with a Pearl attached |
| **Action** | Wait for shark collision |
| **Expected** | Pearl stolen; "STOLEN!" shown |
| **Pass Criterion** | No score; hook empty |

---

### TC-06 — Stone NOT eaten by shark (negative case)

| Field | Detail |
|---|---|
| **Preconditions** | P1–P3; hook retracting with a Stone attached |
| **Action** | Let shark swim through the Stone's position |
| **Expected** | Shark ignores the Stone completely; no "STOLEN!" text; no SFX |
| **Pass Criterion** | Stone remains on hook and is returned normally |

---

### TC-07 — Fish Bone NOT eaten by shark (negative case)

| Field | Detail |
|---|---|
| **Preconditions** | P1–P3; hook retracting with a Fish Bone attached |
| **Action** | Let shark swim through the Fish Bone's position |
| **Expected** | Shark ignores the Fish Bone; no "STOLEN!" text; no SFX |
| **Pass Criterion** | Fish Bone remains on hook and is returned normally |

---

### TC-08 — Shark does NOT steal item while hook is going DOWN (negative case)

| Field | Detail |
|---|---|
| **Preconditions** | P1–P3; hook is in `MOVING_DOWN` state (not yet grabbed anything) |
| **Action** | Shark swims past hook tip |
| **Expected** | No stealing; hook continues descending |
| **Pass Criterion** | Hook behaviour unchanged |

---

### TC-09 — Shark does NOT steal item while hook is IDLE (negative case)

| Field | Detail |
|---|---|
| **Preconditions** | P1–P3; hook is in `IDLE_SWINGING` state |
| **Action** | Shark swims past hook |
| **Expected** | No stealing; hook continues swinging |
| **Pass Criterion** | Hook behaviour unchanged |

---

### TC-10 — No shark stealing in shallow-sea mode (non-deep-sea)

| Field | Detail |
|---|---|
| **Preconditions** | Player does **NOT** own the Submarine; game is in shallow-sea mode |
| **Action** | Play normally; no shark should spawn |
| **Expected** | No sharks appear; no stealing events |
| **Pass Criterion** | Shark system is entirely inactive |

---

### TC-11 — FishboneCollector power-up: Stone/Bone still not eaten

| Field | Detail |
|---|---|
| **Preconditions** | P1–P3; player owns **FishboneCollector** item; hook retracting with Stone or Fish Bone |
| **Action** | Shark overlaps Stone/Fish Bone on hook |
| **Expected** | Shark still ignores Stone/Bone (FishboneCollector does not change this) |
| **Pass Criterion** | Stone/Bone returned; score bonus from FishboneCollector applied normally |

---

### TC-12 — Two-player mode: each player's hook independently checked

| Field | Detail |
|---|---|
| **Preconditions** | P1–P3; two-player mode; Player 1 hook retracts a fish, Player 2 hook retracts a stone |
| **Action** | Shark collides with P1's fish position then crosses P2's stone position |
| **Expected** | P1's fish is stolen; P2's stone is NOT stolen |
| **Pass Criterion** | P1 loses item, P2 retains item |

---

## Collision Radius Reference (for testers)

The shark's **effective bite zone** is a circle centred at the shark's head:

```
headX = shark.x + shark.direction * shark.width * 0.35
headY = shark.y
biteRadius = 25 + item.catchRadius  (where catchRadius defaults to item.width / 2)
```

Sharks spawn from off-screen edges and move horizontally at `speed = random(3, 6)`. Spawn interval is randomised between **300 and 480 frames** (~5–8 seconds at 60 fps).

---

## Summary Matrix

| Scenario | Hook State | Item Type | Shark Eats? |
|----------|-----------|-----------|:-----------:|
| Normal catch — small fish | MOVING_UP | SmallFish | YES |
| Normal catch — big fish | MOVING_UP | BigFish | YES |
| Normal catch — angler fish | MOVING_UP | AnglerFish | YES |
| Normal catch — treasure | MOVING_UP | TreasureChest | YES |
| Normal catch — pearl | MOVING_UP | Pearl | YES |
| Junk catch — stone | MOVING_UP | Stone | NO |
| Junk catch — fish bone | MOVING_UP | FishBone | NO |
| Hook descending | MOVING_DOWN | any | NO |
| Hook idle | IDLE_SWINGING | any | NO |
| Shallow sea (no submarine) | any | any | NO |

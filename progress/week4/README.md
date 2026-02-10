# DeepSea Prospector ⚓💎

## Stakeholders

### Direct Stakeholders

These are the individuals directly involved in the creation, testing, and interaction with the game:

- **Player / Game Tester** 🎮
    - **Role:** The end-users and internal testers.
    - **Responsibilities:** Play and test the game, find bugs, and give feedback on the gameplay experience.
- **Developer / Coder** 👨‍💻
    - **Role:** The technical implementation team.
    - **Responsibilities:** Implement game mechanics such as fishing controls, scoring, and progression systems.
- **Game Designer** 📐
    - **Role:** The architect of the gameplay experience.
    - **Responsibilities:** Design fish behaviour, scoring rules, difficulty balance, and overall gameplay flow.
- **Artist / UI Designer** 🎨
    - **Role:** The visual creator.
    - **Responsibilities:** Create visual assets including fish, backgrounds, animations, effects, and user interface elements.

---

## Epics and User Stories

### 📌 Epic 1: Player Input, Hook States & Core Loop
Goal: Ensure the primary interaction loop (aim → drop → attach/miss → retract → resolve) feels responsive and consistent.

- **As a** Player, **I want** a single-button drop action, **so that** I can start playing instantly without complex controls.  
  - _Acceptance Criteria:_ **Given** the hook is in the surface "Aiming" state, **When** I press `Space`, **Then** the hook transitions to "Dropping" and begins moving downward immediately (no visible delay).

- **As a** Player, **I want** a manual recall action, **so that** I can cancel a bad attempt and reduce frustration.  
  - _Acceptance Criteria:_ **Given** the hook is currently "Dropping", **When** I press `R`, **Then** the hook switches to "Retracting" within 1 frame.

- **As a** Player, **I want** the hook behaviour to be state-driven, **so that** it always behaves predictably.  
  - _Acceptance Criteria:_ **Given** the hook is "Retracting", **When** I press `Space` repeatedly, **Then** no new drop starts until the hook returns to "Aiming".

- **As a** Developer, **I want** the hook to respect boundary rules, **so that** the attempt always terminates cleanly.  
  - _Acceptance Criteria:_ **Given** the hook is "Dropping", **When** it reaches max depth, **Then** it automatically enters "Retracting" within 1 frame.

---

### 🐟 Epic 2: Capture Rules, Item Properties & Scoring
Goal: Define what can be captured, how capture works, and how score/gold is calculated and displayed.

- **As a** Player, **I want** items to have distinct value and weight, **so that** I can make meaningful choices between quick grabs and high rewards.  
  - _Acceptance Criteria:_ **Given** two items with different weights, **When** each item is retrieved successfully in separate attempts, **Then** the heavier item retracts slower and awards the configured higher value.

- **As a** Player, **I want** only one item to attach per attempt, **so that** outcomes remain clear and balanced.  
  - _Acceptance Criteria:_ **Given** an item is already attached to the hook, **When** the hook collides with another item, **Then** the second item does not attach and continues moving normally.

- **As a** Tester, **I want** an end-of-attempt summary, **so that** I can verify scoring correctness quickly.  
  - _Acceptance Criteria:_ **Given** an attempt ends (successful delivery or loss), **When** the result is resolved, **Then** the UI shows the item name, item value awarded, and updated total gold/score.

- **As a** Game Designer, **I want** spawn probabilities to be configurable, **so that** balancing rare items does not require code changes.  
  - _Acceptance Criteria:_ **Given** spawn rates are defined in a config table, **When** a rare item probability is reduced, **Then** repeated test runs show a lower observed spawn frequency consistent with the new config.

---

### 🌊 Epic 3: Environment Effects, Obstacles & Threat Interactions
Goal: Add deep-sea uncertainty (currents, obstacles, predators) while keeping behaviour testable and fair.

- **As a** Player, **I want** currents to influence target movement, **so that** aiming requires prediction rather than pure reaction.  
  - _Acceptance Criteria:_ **Given** the current indicator points Right, **When** a target swims Right, **Then** its horizontal speed is increased by a configured multiplier compared to swimming Left.

- **As a** Player, **I want** obstacles to interrupt careless drops, **so that** accuracy matters.  
  - _Acceptance Criteria:_ **Given** the hook is "Dropping", **When** it collides with an obstacle (e.g., Reef/Rock), **Then** the hook immediately switches to "Retracting" and awards no capture for that attempt.

- **As a** Challenge Seeker, **I want** a predator to be able to cause me to lose a captured item, **so that** high-value retrieval feels tense.  
  - _Acceptance Criteria:_ **Given** an item is attached and the hook is "Retracting", **When** a predator collides with the attached item, **Then** the item detaches (or is destroyed) and awards $0 for that item.

- **As a** Game Designer, **I want** environmental difficulty to scale by mode, **so that** "Deep Sea" is meaningfully harder than "Shallow".  
  - _Acceptance Criteria:_ **Given** "Deep Sea" mode is selected, **When** the level starts, **Then** configured threat speed and/or spawn rate values are higher than in "Shallow".

---

### 🛒 Epic 4: Shop, Upgrades & Persistent Progression
Goal: Create a clear earn→buy→improve loop with strict rules (validation, persistence, and readable effects).

- **As a** Player, **I want** a shop screen between levels, **so that** I can spend earnings on upgrades before the next challenge.  
  - _Acceptance Criteria:_ **Given** a level ends, **When** I continue, **Then** I enter the shop and see my current gold and a list of upgrades.

- **As a** Player, **I want** each upgrade to clearly describe its effect, **so that** I can make informed purchase decisions.  
  - _Acceptance Criteria:_ **Given** an upgrade card is visible, **When** I select it, **Then** the UI displays its cost and a concrete effect description (e.g., "+20% reel speed").

- **As a** Player, **I want** purchase validation, **so that** I cannot buy upgrades I cannot afford.  
  - _Acceptance Criteria:_ **Given** my gold is below the upgrade cost, **When** I click "Buy", **Then** gold is unchanged, the upgrade is not granted, and a warning is shown.

- **As a** Developer, **I want** upgrade effects to be data-driven, **so that** balancing and tuning does not require editing gameplay code.  
  - _Acceptance Criteria:_ **Given** upgrades are defined in a config asset (e.g., ScriptableObject/JSON), **When** an upgrade parameter is changed, **Then** the new value takes effect on the next run without modifying logic code.

---

### 🧭 Epic 5: Level Objectives, Pass/Fail Results & Leaderboard
Goal: Deliver a complete session flow: objectives → timed run → evaluation → next/retry → record performance.

- **As a** Player, **I want** a visible quota and countdown timer, **so that** I always know how close I am to success.  
  - _Acceptance Criteria:_ **Given** a level begins, **When** gameplay starts, **Then** the UI displays remaining time and remaining quota immediately.

- **As a** Player, **I want** clear pass/fail outcomes with next actions, **so that** I know what happens after the timer ends.  
  - _Acceptance Criteria:_ **Given** time reaches 0, **When** total value ≥ quota, **Then** show a "Pass" screen with a "Next" button; **And** **When** total value < quota, **Then** show a "Fail" screen with a "Retry" button that restarts the level.

- **As a** Player, **I want** optional special objectives, **so that** some levels feel different beyond just hitting a quota.  
  - _Acceptance Criteria:_ **Given** a special-objective level is active, **When** the level starts, **Then** the objective text is shown; **And** **When** the special item is delivered, **Then** the objective is marked completed.

- **As a** Competitive Player, **I want** a local leaderboard, **so that** I can compare my best runs over time.  
  - _Acceptance Criteria:_ **Given** a run ends, **When** I submit a player name, **Then** the score is saved and displayed in descending order on the leaderboard screen.

---

### Reflection
**1.**  In the development project of this fishing game (Deep Sea Prospector), Value vs Effort Matrix is often considered to scientifically schedule the development sequence of tasks/functions. Avoid blindly  investing and wasting resources on low value, high effort tasks such as complex 3D backgrounds. Ensure the smooth completion of software development. 

**2.**  Determine user acceptance criteria  
* **a.**  Is the fish hook used by the player swinging evenly at a constant speed. When the player clicks the mouse, the hook should launch immediately without delay.

* **b.**  When players choose the slightly difficult "deep sea" mode, ocean currents, as the "x factor" in the sea, can change the movement trajectory of various fish. Another 'x factor' shark can damage ordinary fish hooks.

* **c.**  Before the countdown ends, the total value of all items captured must be equal to or greater than the target amount required for this level.

* **d.**  ✅**Pass:** Score up to standard → Proceed to the next level/enter the mall to purchase equipment.

   ❌**Fail:** Score not met or time is up → Challenge this level again.

* **e.**  Special objective: Capture mobile golden koi purchased through the mall within a limited time and complete the capture.

**3.**  We not only include players, but also developers and UI designers in the identification of stakeholders. This makes us realize that demand cannot be driven solely by user experience, but also requires a balance between technical feasibility and the quality of artistic implementation.
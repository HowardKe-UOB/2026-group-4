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

### 📌 Epic 1: Core Fishing Mechanics & Controls

- **As a** Casual Player, **I want** to control the hook using a single key press, **so that** I can easily catch fish without learning complex controls.
    - _Acceptance Criteria:_ **Given** the hook is swinging back and forth, **When** I press the 'Down Arrow Key', **Then** the hook should stop swinging and extend in a straight line.
- **As a** Developer, **I want** a collision detection system, **so that** the hook recognizes when it hits an object versus empty water.
    - _Acceptance Criteria:_ **Given** the hook is extending, **When** the hook collider touches a 'Rock' object, **Then** the hook should stop extending and immediately begin retracting.

### 🦈 Epic 2: Dynamic Ecosystem & Hazards

- **As a** Challenge Seeker, **I want** sharks to patrol the water and eat my catch, **so that** the game feels risky and exciting.
    - _Acceptance Criteria:_ **Given** I am reeling in a captured fish, **When** the shark's body collides with my fish, **Then** the fish should be destroyed and I should earn $0.
- **As a** Strategic Player, **I want** ocean currents to affect the swimming speed of fish, **so that** I must predict their movement before launching my hook.
    - _Acceptance Criteria:_ **Given** bubbles show the current is flowing to the Right, **When** a fish swims to the Right (with the current), **Then** its movement speed should increase by 50% compared to swimming against the current.

### 💰 Epic 3: Economy & Progression Loop

- **As a** Progression Gamer, **I want** to buy upgrades in a shop between levels, **so that** I can handle increasing difficulty.
    - _Acceptance Criteria:_ **Given** I am in the shop screen with 500 gold, **When** I click the 'Buy Laser Sight' button, **Then** 500 gold is deducted and a trajectory line appears in the next level.

### 🎨 Epic 4: Visual Feedback & Immersion

- **As an** Artist, **I want** distinct animations for different fish states, **so that** the player gets visual feedback on their actions.
    - _Acceptance Criteria:_ **Given** a fish is idle swimming, **When** the hook grabs the fish, **Then** the fish sprite should switch to a 'struggling' animation.

---

## Reflection
1.  In the development project of this fishing game (Deep Sea Prospector), Value vs Effort Matrix is often considered to scientifically schedule the development sequence of tasks/functions. Avoid blindly  investing and wasting resources on low value, high effort tasks such as complex 3D backgrounds. Ensure the smooth completion of software development. 

2.  Determine user acceptance criteria  
**a.**  Is the fish hook used by the player swinging evenly at a constant speed. When the player clicks the mouse, the hook should launch immediately without delay.

**b**  When players choose the slightly difficult "deep sea" mode, ocean currents, as the "x factor" in the sea, can change the movement trajectory of various fish. Another 'x factor' shark can damage ordinary fish hooks.

**c.** Before the countdown ends, the total value of all items captured must be equal to or greater than the target amount required for this level.

**d.** ✅ Pass: Score up to standard → Proceed to the next level/enter the mall to purchase equipment.
❌ Fail：Score not met or time is up → Challenge this level again.**  

**e.**  Special objective: Capture mobile golden koi purchased through the mall within a limited time and complete the capture.

3.  We not only include players, but also developers and UI designers in the identification of stakeholders. This makes us realize that demand cannot be driven solely by user experience, but also requires a balance between technical feasibility and the quality of artistic implementation.
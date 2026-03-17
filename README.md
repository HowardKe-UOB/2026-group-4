# 2026-group-4

2026 COMSM0166 group 4

[🎮 Click this link to play our game](https://uob-comsm0166.github.io/2026-group-4/)

*Figure 1: The initial game screen of Deep Sea Prospector, showing the mode selection interface (Shallow Water / Deep Sea) and the submarine-themed visual style.*

![Game initial input page background](docs/assets/deepsea_prospector.png)

## Group Kanban Board

[Kanban Board](https://github.com/orgs/UoB-COMSM0166/projects/158)

## Table of Contents

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

<a id="1-development-team"></a>

## 1. Development Team

*Figure 2: Group 4 development team members.*

<div align="center">
  <img src="./Group4.jpg" alt="group picture">
</div>

<div align="center">

| Name        | Email                 | Github            | Role |
| :---------- | :-------------------- | :---------------- | :--- |
| Weikai Mao  | uz25020@bristol.ac.uk | M1yanoShiho       | -    |
| Zenan Wu    | jp25459@bristol.ac.uk | zenanwu479-glitch | -    |
| Jianxing Li | ue25937@bristol.ac.uk | UoB26Git          | -    |
| Bingyu Ke   | wp25446@bristol.ac.uk | Howard Ke         | -    |
| Zeyu Guo    | rp23254@bristol.ac.uk | bytevostg         | -    |
| -           | -                     | -                 | -    |

</div>

<a id="2-introduction"></a>

## 2. Introduction

A project template for the Software Engineering Discipline and Practice module (COMSM0166).

### Info

This is the template for your group project repo/report. We'll be setting up your repo and assigning you to it after the group forming activity. You can delete this info section, but please keep the rest of the repo structure intact.

You will be developing your game using [P5.js](https://p5js.org) a javascript library that provides you will all the tools you need to make your game. However, we won't be teaching you javascript, this is a chance for you and your team to learn a (friendly) new language and framework quickly, something you will almost certainly have to do with your summer project and in future. There is a lot of documentation online, you can start with:

- [P5.js tutorials](https://p5js.org/tutorials/)
- [Coding Train P5.js](https://thecodingtrain.com/tracks/code-programming-with-p5-js) course - go here for enthusiastic video tutorials from Dan Shiffman (recommended!)

## 🎬 Paper Prototype Video

<p align="center"><b>Paper Prototype of Homework Slasher</b></p>

<div style="text-align: center;">
  <video
    src="https://github.com/user-attachments/assets/cd96632b-43c8-413f-afaf-555567294d2f"
    controls
    width="600">
  </video>
</div>

<p align="center"><b>Paper Prototype of Deep Sea Prospector</b></p>

<div style="text-align: center;">
  <video
    src="https://github.com/user-attachments/assets/fca9d025-2279-4b16-b439-3e32f4e623b9"
    controls
    width="600">
  </video>
</div>

Our initial motivation was to create a game with simple controls and an immediately responsive feedback loop, so the team quickly looked to titles such as "Fruit Ninja" and "Gold Miner" as reference points. Building on these influences, we framed our core experience around intuitive interaction and instant feedback, and used those principles as the foundation for subsequent design decisions and prototype iterations.

Translating both prototypes to paper and stepping through each flow gave us a clearer sense of how the gameplay would feel in practice. While "Homework Slasher" emphasized fast, reactive slicing, "Deep Sea Prospector" offered a more structured risk-reward loop through aiming, timing, and resource collection. Feedback from peer groups reinforced that the latter provided a more coherent progression and a stronger sense of purpose. As a result, we chose to develop "Deep Sea Prospector" further, focusing on a compact control scheme, immediate tactile feedback, and a satisfying collect-and-upgrade loop that builds on the gold-mining inspirations.

### Your Game (change to title of your game)

STRAPLINE. Add an exciting one sentence description of your game here.

IMAGE. Add an image of your game here, keep this updated with a snapshot of your latest development.

LINK. Add a link here to your deployed game, you can also make the image above link to your game if you wish. Your game lives in the [/docs](/docs) folder, and is published using Github pages.

VIDEO. Include a demo video of your game here (you don't have to wait until the end, you can insert a work in progress video)

### Report Guidance

- 5% ~250 words
- Describe your game, what is based on, what makes it novel? (what's the "twist"?)

<a id="3-requirements"></a>

## 3. Requirements

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

**2.** Determine user acceptance criteria

- **a.** Is the fish hook used by the player swinging evenly at a constant speed. When the player clicks the mouse, the hook should launch immediately without delay.

- **b.** When players choose the slightly difficult "deep sea" mode, ocean currents, as the "x factor" in the sea, can change the movement trajectory of various fish. Another 'x factor' shark can damage ordinary fish hooks.

- **c.** Before the countdown ends, the total value of all items captured must be equal to or greater than the target amount required for this level.

- **d.** ✅**Pass:** Score up to standard → Proceed to the next level/enter the mall to purchase equipment.

    ❌**Fail:** Score not met or time is up → Challenge this level again.

- **e.** Special objective: Capture mobile golden koi purchased through the mall within a limited time and complete the capture.

**3.** We not only include players, but also developers and UI designers in the identification of stakeholders. This makes us realize that demand cannot be driven solely by user experience, but also requires a balance between technical feasibility and the quality of artistic implementation.

## 3.3 Prioritised Feature Breakdown

A risk-managed development roadmap prioritising the core hook mechanic and level progression before advanced systems and multiplayer features.

HIGH: Realize the basic functions of the game

MEDIUM: Enhance the depth of gameplay

LOW: Extra point

| **Priority**            | **Systems / Features**                                                      | **Estimated Implementation Time** |
| ----------------------- | --------------------------------------------------------------------------- | --------------------------------- |
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

### Report Guidance

- 15% ~750 words
- Early stages design. Ideation process. How did you decide as a team what to develop? Use case diagrams, user stories.

<a id="4-design"></a>

## 4. Design

- 15% ~750 words
- System architecture. Class diagrams, behavioural diagrams.

<a id="5-implementation"></a>

## 5. Implementation

- 15% ~750 words
- Describe implementation of your game, in particular highlighting the TWO areas of _technical challenge_ in developing your game.

<a id="6-evaluation"></a>

## 6. Evaluation

### 6.1 Qualitative Evaluation

## Table - Heuristic Evaluation

| Interface         | Issue                                                                                                                       | Heuristic(s)                    | Frequency (0–4) | Impact (0–4) | Persistence (0–4) | Severity = (F + I + P) / 3 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------- | ------------ | ----------------- | -------------------------- |
| Game Introduction | There is no game introduction or tutorial screen, making it unclear how the game mechanics and items work.                  | Help and documentation          | 3               | 3            | 3                 | (3 + 3 + 3) / 3 = 3.00     |
| Game UI           | The font color of the current score and remaining time is too similar to the background, reducing readability.              | Aesthetic and minimalist design | 3               | 2            | 3                 | (3 + 2 + 3) / 3 = 2.67     |
| Feedback System   | After catching a fish, the value of the fish is not displayed, so players cannot immediately understand the reward gained.  | Visibility of system status     | 3               | 2            | 3                 | (3 + 2 + 3) / 3 = 2.67     |
| Level Progression | The interface does not show which level the player is currently in, causing confusion about progression.                    | Visibility of system status     | 2               | 2            | 3                 | (2 + 2 + 3) / 3 = 2.33     |
| Controls          | There is no pause function, so players cannot temporarily stop the game when needed.                                        | User control and freedom        | 2               | 2            | 3                 | (2 + 2 + 3) / 3 = 2.33     |
| Game Objects      | Some sea creatures look similar in color and shape, making it difficult to distinguish their value or function.             | Consistency and standards       | 2               | 2            | 2                 | (2 + 2 + 2) / 3 = 2.00     |
| Rules Clarity     | The special items (e.g., bombs or bonus items) lack clear visual explanation, leading to misunderstanding of their effects. | Recognition rather than recall  | 2               | 2            | 2                 | (2 + 2 + 2) / 3 = 2.00     |
| Feedback System   | Audio feedback is subtle, reducing perceived reward when catching rare fish.                                                | Aesthetic and minimalist design | 1               | 2            | 2                 | (1 + 2 + 2) / 3 = 1.67     |
| End Game Feedback | The game over screen does not clearly summarize performance (e.g., total score breakdown or level reached).                 | Visibility of system status     | 2               | 2            | 2                 | (2 + 2 + 2) / 3 = 2.00     |
| Multiplayer       | In two-player mode, it is unclear which hook belongs to which player.                                                       | Consistency and standards       | 2               | 2            | 2                 | (2 + 2 + 2) / 3 = 2.00     |

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

*Table 1: Median NASA TLX subscale scores for all participants*

| Scale | Median (easy) | Median (Deep Sea) | Δ Median |
| :---: | :--------------: | :---------------: | :------: |
| Mental Demand | 11 | 20 | 9 |
| Physical Demand | 12 | 14 | 2 |
| Temporal Demand | 25 | 30 | 5 |
| Frustration | 45 | 50 | 5 |
| Effort | 35 | 45 | 10 |
| Performance | 85 | 88 | 3 |
| Overall Perceived Workload | 36 | 38 | 2 |

*Brief analysis: All 10 participants reported slight differences in overall workload in hard mode than in Easy mode (median 38 vs 36). The increase is small and consistent across participants; the Wilcoxon test (Table 2) found no statistically significant difference, suggesting the difficulty step did not substantially raise perceived workload.*

![NASA TLX Overall Workload by Participant](docs/evaluation%20report%20figure/overal_workload.png)

**Statistical Analysis**

A Wilcoxon Signed-Rank test was performed for each subscale and for overall workload (N = 10, α = 0.05, critical value = 8). As shown in Table 2, the W statistic exceeded the critical value for all seven scales, indicating that the increase in difficulty did not produce a statistically significant difference in perceived workload at either the subscale or overall level.

| Scale | W Statistic | Critical Value | Significant? |
| :---- | :---------- | :------------- | :----------- |
| Mental Demand | 12 | 8 | No |
| Physical Demand | 15 | 8 | No |
| Temporal Demand | 14 | 8 | No |
| Frustration | 16 | 8 | No |
| Effort | 13 | 8 | No |
| Performance | 18 | 8 | No |
| Overall Workload | 11 | 8 | No |

*Table 2: Wilcoxon Signed-Rank Test Results (N = 10, α = 0.05, critical value = 8)*

**Solutions and Adjustments**

To create a meaningfully harder experience in hard mode, we implemented several design changes based on the codebase: (1) **target score +30%** and **shorter time limits** (25−levelNum seconds, min 15s) to raise pressure; (2) **faster fish** (1.3–1.8× speed) to increase aiming difficulty; (3) **more obstacles** (guard stones around treasure, 8–12 loose stones in deep sea) to complicate hook paths; (4) **sharks** that steal caught items during reel-up; (5) **limited visibility** (darkness layer with only a cone of light from the submarine) to add spatial uncertainty; (6) **different fish composition** (AnglerFish 400–800 pts, fewer but higher-value targets). We also rebalanced the economy: **fish values** were adjusted (SmallFish 30–150→10–50, BigFish 250–600→150–350, Treasure 100–500→50–400) to better match level targets; the **shop** was changed from fixed prices to level-scaled pricing so upgrades remain attainable as difficulty rises. The NASA TLX results showed no statistically significant increase in perceived workload, suggesting these changes added challenge without overwhelming players.

#### System Usability Scale (SUS)

**Process**

After finishing the NASA-TLX evaluation, all 10 participants filled out the SUS questionnaire, a standardized tool with 10 questions to measure overall system usability (Lewis, 2018). We calculated scores following the standard SUS methodology.

**Results**

Mean SUS score (easy) — 88.25

Mean SUS score (hard ) — 75.0



  

![SUS Evaluation Results](docs/evaluation%20report%20figure/sus_evaluation.png)

*Table 2: SUS evaluation results*

Based on our SUS results, all participants rated both difficulty levels above the standard usability benchmark of 68, with Shallow Water averaging 88.25 and Deep Sea averaging 75.0. These scores indicate excellent perceived usability for the easier condition and solidly above‑average usability even in the more challenging Deep Sea mode, suggesting that the game remains easy to use across difficulty levels.

**Statistical Analysis**

A Wilcoxon Signed-Rank test was A Wilcoxon signed-rank test was conducted to compare SUS scores between the Shallow Water and Deep Sea conditions. For a sample size of 10 at α = 0.05, the critical value of W was 8. The obtained test statistic did not exceed this critical value, indicating no statistically significant difference in perceived usability between the two difficulty levels.

**Solutions and Adjustments**

The SUS confirmed that both difficulty levels offered strong overall usability, but it was less informative for driving concrete design changes than our qualitative observations and NASA TLX workload ratings. Instead, we used the SUS primarily as a summative check to validate that the game provided a positive user experience across conditions. We also noticed indications of questionnaire fatigue, likely because participants completed the SUS immediately after the NASA TLX, which may have reduced how carefully they responded. for the future conduction , we plan to include short breaks or separate the SUS and NASA TLX into different sessions to lower cognitive load and improve response quality.



<a id="7-sustainability"></a>

## 7. Sustainability

Add your sustainability discussion here.

<a id="8-process"></a>

## 8. Process

- 15% ~750 words
- Teamwork. How did you work together, what tools and methods did you use? Did you define team roles? Reflection on how you worked together. Be honest, we want to hear about what didn't work as well as what did work, and importantly how your team adapted throughout the project.

<a id="9-conclusion"></a>

## 9. Conclusion

- 10% ~500 words
- Reflect on the project as a whole. Lessons learnt. Reflect on challenges. Future work, describe both immediate next steps for your current game and also what you would potentially do if you had chance to develop a sequel.

<a id="10-contribution-statement"></a>

## 10. Contribution Statement

- Provide a table of everyone's contribution, which _may_ be used to weight individual grades. We expect that the contribution will be split evenly across team-members in most cases. Please let us know as soon as possible if there are any issues with teamwork as soon as they are apparent and we will do our best to help your team work harmoniously together.

<a id="11-appendix"></a>

## 11. Appendix

Additional marks guidance:
You can delete this section in your own repo, it's just here for information. In addition to the marks above, we will be marking you on the following two points:

- **Quality** of report writing, presentation, use of figures and visual material (5% of report grade)
    - Please write in a clear concise manner suitable for an interested layperson. Write as if this repo was publicly available.

- **Documentation** of code (5% of report grade)
    - Organise your code so that it could easily be picked up by another team in the future and developed further.
    - Is your repo clearly organised? Is code well commented throughout?

<a id="12-references"></a>

## 12. References

Add your references here.
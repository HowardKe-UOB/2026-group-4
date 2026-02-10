# 2026-group-4

2026 COMSM0166 group 4

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
### Stakeholder table
| Stakeholder                 | Epic                        | User Story                                                                                                                                           | Acceptance Criteria                                                                                                                                                                                                   |
| :-------------------------- | :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User: Casual Player**     | Core Fishing Mechanics      | "As a casual player, I want to control the hook using a single key press, so that I can easily catch fish without learning complex controls."        | **Given** the hook is swinging back and forth,<br>**When** I press the 'Down Arrow Key',<br>**Then** the hook should stop swinging and extend in a straight line.                                                     |
| **User: Challenge Seeker**  | Dynamic Ecosystem & Hazards | "As a challenge seeker, I want sharks to patrol the water and eat my catch, so that the game feels risky and exciting."                              | **Given** I am reeling in a captured fish,<br>**When** the shark's body collides with my fish,<br>**Then** the fish should be destroyed and I should earn $0.                                                         |
| **User: Strategic Player**  | Dynamic Ecosystem & Hazards | "As a strategic player, I want ocean currents to affect the swimming speed of fish, so that I must predict their movement before launching my hook." | **Given** bubbles show the current is flowing to the Right,<br>**When** a fish swims to the Right (with the current),<br>**Then** its movement speed should increase by 50% compared to swimming against the current. |
| **User: Progression Gamer** | Economy & Progression Loop  | "As a progression-focused gamer, I want to buy upgrades in a shop between levels, so that I can handle increasing difficulty."                       | **Given** I am in the shop screen with 500 gold,<br>**When** I click the 'Buy Laser Sight' button,<br>**Then** 500 gold is deducted and a trajectory line appears in the next level.                                  |
| **User: Developer**         | Core Fishing Mechanics      | "As a developer, I want a collision detection system, so that the hook recognizes when it hits an object versus empty water."                        | **Given** the hook is extending,<br>**When** the hook collider touches a 'Rock' object,<br>**Then** the hook should stop extending and immediately begin retracting.                                                  |
| **User: Artist**            | Visual Feedback & Immersion | "As an artist, I want distinct animations for different fish states, so that the player gets visual feedback on their actions."                      | **Given** a fish is idle swimming,<br>**When** the hook grabs the fish,<br>**Then** the fish sprite should switch to a 'struggling' animation.                                                                        |

### Reflection
**1.**  In the development project of this fishing game (Deep Sea Prospector), Value vs Effort Matrix is often considered to scientifically schedule the development sequence of tasks/functions. Avoid blindly  investing and wasting resources on low value, high effort tasks such as complex 3D backgrounds. Ensure the smooth completion of software development. 

**2.**  Determine user acceptance criteria  
a. Is the fish hook used by the player swinging evenly at a constant speed. When the player clicks the mouse, the hook should launch immediately without delay.

b. When players choose the slightly difficult "deep sea" mode, ocean currents, as the "x factor" in the sea, can change the movement trajectory of various fish. Another 'x factor' shark can damage ordinary fish hooks.

c. Before the countdown ends, the total value of all items captured must be equal to or greater than the target amount required for this level.

d. ✅ Pass: Score up to standard → Proceed to the next level/enter the mall to purchase equipment.

❌ Fail：Score not met or time is up → Challenge this level again.

e. Special objective: Capture mobile golden koi purchased through the mall within a limited time and complete the capture.

**3.**  We not only include players, but also developers and UI designers in the identification of stakeholders. This makes us realize that demand cannot be driven solely by user experience, but also requires a balance between technical feasibility and the quality of artistic implementation.


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

- 15% ~750 words
- One qualitative evaluation (of your choice)
- One quantitative evaluation (of your choice)
- Description of how code was tested.

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

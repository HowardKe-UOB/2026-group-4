# Project Outlines

- searching the recent legendary and basic version of the game
- analyze key elements,features  and key technique interm of mapping and classes needed in the game 
- Game development in ~5 weeks
- Plan expansions for extra time

## Game Ideas

### Idea 1 - Contra

Inspiration:
- Contra
- Arcade shooters

Fundamentals:
- Side-scrolling action
- Run-and-gun shooting
- Enemy waves and boss fights

Nice to haves:
- Co-op mode
- Weapon upgrades

### Idea 2 - Gold Miner Prospector

Inspiration:
- Building upon the classic "Gold Miner" game, this enhanced version introduces new items, environmental mechanics, and dynamic challenges to deepen the strategic gameplay.
- Casual arcade game

Fundamentals:
- Hook-and-reel mechanic
- Time-based levels
- Score and item system

New Items & Mechanics:

Mud-Swine Bait: 
- A consumable item. When used, a "Diamond Mud-Swine" spawns in the next level, walking horizontally across the screen from left to right before disappearing. If successfully hooked within its short appearance window, it grants a big reward.

Laser Sight: 
- An upgrade that lasts for 3 subsequent levels. It provides a real-time laser pointer attached to the claw, visually indicating its exact trajectory and predicted grab point, significantly improving aiming precision.

Hourglass: 
- Increases the total time limit for the next level only.

Reinforced Claw: 
- A single-use power-up for the next level. It enables the claw to successfully latch onto and pull "Massive Ore"—a special, high-value, high-weight obstacle.

Massive Ore Mechanic: 
- The items located directly beneath the huge rock block would normally be impossible to catch. The standard claw will bounce off it upon contact, failing to grab anything. The Reinforced Claw is required to harvest it.

Environmental Mechanics (Level Modifiers):

Dense Clay / Loose Soil: 
- Represented by distinct background visuals, these global modifiers affect all pullable objects in a level.

Dense Clay: 
- Increases the effective "weight" or pull resistance of all objects, requiring more time and power to reel them in.

Loose Soil: 
- Decreases pull resistance, allowing for faster and easier retrieval of items.

Dynamic Hazards:

Out-of-Control Drill Rig: 
- A slow-moving, indestructible hazard that moves horizontally across the level. It destroys any collectible item (gold, diamonds, items) in its path. The player's claw and rope pass through it harmlessly, forcing strategic timing around its patrol route.

Nice to haves:
- Power-ups
- Endless mode

### Idea 3 - Homework Slasher
Inspiration:
- A twist on the classic "Fruit Ninja" game, replacing the blade with a pen and fruits with homework assignments from various subjects. Players slash through floating homework papers to score points.
- Casual arcade game

Fundamentals:
- Mouse tracking and collision detection
- Time-based levels
- Reward items and scores

Core Mechanics:

Standard Assignment: 
- When the player's pen touches a standard homework sheet, a green checkmark (✓) appears on it. The paper then shatters into pieces (similar to sliced fruit in the original game) after a 0.5-second visual delay, and points are awarded.

Combo Bonus: 
- A consecutive slash of three or more assignments triggers a combo, granting bonus points.

"Hard Subject" (Bomb Equivalent): 
- One particularly difficult subject (e.g., "Advanced Calculus") replaces the role of bombs. If the player's pen touches this paper, a red cross (✗) appears on it. The paper does not shatter. This action results in a score penalty and breaks any ongoing combo.

Power-up: 
- Golden Pen: Upon contact with a special floating "Golden Pen" item, the player enters a powered-up state for a limited time (e.g., 5 seconds). During this time, the pen can slice through any type of assignment (including the "Hard Subject") without penalty, with all assignments displaying the green checkmark and shattering for points.

Scoring & Progression: 
- The total score determines the number of stars earned at the end of a level or session (e.g., 1-3 stars). Higher scores unlock more stars.



- ## Challenges
Different difficulty levels, high score list, two-player mode, physics engine, map generation, collision detection

### Technical Challenges

As the game's complexity increased to accommodate the new difficulty modes, we encountered and resolved several technical hurdles. Here are the two primary technical challenges we faced:

#### 1. Dynamic Visibility Layer and Light Cone Rendering
**The Challenge:** To create a meaningfully harder experience in Hard Mode, we introduced a "limited visibility" mechanic. This required generating a dynamic darkness layer covering the entire 1280x720 canvas, punctured only by a real-time cone of light emanating from the player's submarine.

**Technical Implementation:** The core technical difficulty was performing real-time masking and pixel blending without causing frame rate drops. In a 2D canvas context (p5.js), this involved utilizing off-screen rendering buffers (`p5.Graphics`) and advanced `blendMode()` operations (like `ERASE` or `MULTIPLY`) to subtract the light cone shape from the darkness overlay. It required precise coordinate mapping to ensure the light cone perfectly tracks the submarine's movement, rotation, and current depth, maintaining a stable 60 FPS loop despite rendering continuous transparent overlays.

**Rendering Pipeline Comparison:**
| Rendering Component | Shallow Water (Easy) | Deep Sea (Hard) | Performance Impact |
| :--- | :--- | :--- | :--- |
| **Canvas Overlay** | None (Static Background) | Dynamic darkness layer (1280x720) | High (Requires high pixel fill rate) |
| **Masking Buffer** | Not required | Real-time `p5.Graphics` buffer | Medium (Extra memory allocation) |
| **Pixel Blending** | `BLEND` (Default) | `ERASE` / `MULTIPLY` operations | Medium (Requires GPU/CPU sync) |
| **Target FPS** | Stable 60 FPS | Stable 60 FPS | **High optimization required** |

#### 2. Entity State Management for Complex Interactions
**The Challenge:** We implemented a new enemy type in the Deep Sea mode: sharks that can steal caught items during the reel-up phase. This dramatically increased the complexity of our game's collision detection and entity state logic.

**Technical Implementation:** Previously, game items had a linear state progression (idle -> hooked -> scored). The shark mechanic introduced a complex, dynamic interruption. From a software engineering perspective, this required building a more robust state machine. The system must continuously calculate dynamic intersection paths between the retracting hook and moving shark entities. Upon collision, the game must safely decouple the item object from the hook's array reference, re-parent it to the shark entity, alter the shark's AI state (e.g., triggering a "fleeing" behavior), and handle garbage collection appropriately to prevent null reference exceptions or memory leaks.

**Item State Transition Matrix:**
| Game Scenario | Standard Flow (Linear) | Shark Interruption Flow (Dynamic) |
| :--- | :--- | :--- |
| **Initial State** | Idle (Swimming freely) | Idle (Swimming freely) |
| **Trigger Action** | Hook Collision | Hook Collision |
| **Transition State**| Attached to Reeling Hook | Attached to Reeling Hook |
| **Interruption** | *N/A (Guaranteed catch)* | **Shark Collision triggers "Steal" Event** |
| **Entity Reparenting**| *N/A* | Decoupled from Hook ➔ Reparented to Shark |
| **Final Resolution**| Reeled in ➔ Scored ➔ Destroyed | Shark Flees screen ➔ Item Garbage Collected |
### Conclusion and Next Steps

In summary, this iterative development cycle successfully balanced gameplay difficulty with overall system usability. By triangulating our data—combining qualitative observations (Think Aloud and Heuristic Evaluations) with robust quantitative metrics (NASA-TLX and SUS)—we confirmed that the transition from Shallow Water to the Deep Sea mode offers a meaningfully heightened challenge without inducing user frustration. 

Furthermore, overcoming the technical challenges of dynamic rendering and complex state management highlights our team's commitment to robust software engineering practices. All developments, including these new mechanics and codebase refactoring, have been systematically tracked, version-controlled, and seamlessly deployed via our GitHub repository (hosted strictly from the `docs` folder as per project requirements).

**Future Plan & Next Steps:**
Moving forward, we will continue to refine the game's economy and obstacle generation algorithms based on the minor feedback collected. Additionally, as part of our ongoing iterative process, we plan to conduct a more in-depth qualitative evaluation. We aim to recruit peers specifically from our COMSM0166 unit to playtest the latest build, focusing on observing how players navigate the newly implemented UI and shark mechanics under pressure.
### Software Quality & Testing

In Week 9, our team focused on **Software Quality Assurance (SQA)**, specifically applying formal testing methodologies to our core gameplay mechanics. This ensures that our "Technical Challenges"—such as the physics-based hook and the Expected Value balance framework—are not only conceptually sound but also technically robust.

#### 1. Black-Box Testing Matrix (Equivalence Partitioning)
We utilized **Equivalence Partitioning** to define test cases for the Hook System. By identifying input categories (Distance, Hook State, Item Weight) and their constraints, we validated the system's reliability.

| Test Category | Target Component | Input/Behavior Partition | Expected Result | Actual Observation |
| :--- | :--- | :--- | :--- | :--- |
| **Logic/Collision** | Hook Capture | $d < catchRadius$ + `MOVING_DOWN` | Item attaches to hook; transition to `MOVING_UP`. | Successfully captured items at edge of radius. |
| **State Control** | State Machine | $d < catchRadius$ + `MOVING_UP` | Ignore collision; do not capture secondary items. | Prevention of "multi-catch" bugs confirmed. |
| **Physics/Math** | Retrieval Speed | $W \ge 8$ (e.g., Treasure Chest) | retrievalSpeed significantly decreases via EV formula. | Retrieval time matches calculated math model. |
| **Hazard/Interruption** | Shark Mechanic | Shark overlaps Hooked Item | Trigger `destroy()` on item; reset Hook to base speed. | Item stolen successfully; no score added. |

#### 2. Project Check-in & Quality Control
As per the Workshop 9 guidelines, we performed a comprehensive project check-in:
* **Repo Status:** Our GitHub repository is fully synchronized with all previous homework assignments, including qualitative and quantitative evaluations.
* **Challenge Validation:** Our two technical challenges (Physics Hook & EV Balance Framework) remain well-defined and are being continuously refined through testing.
* **Sprint Planning:** We have scheduled three weekly sprints over the upcoming period to polish UI consistency and optimize cloud data fetching for the leaderboard.

#### 3. Conclusion for Week 9
The implementation of these systematic tests has significantly reduced technical debt. By documenting our testing procedures, we have prepared the necessary materials for the **15% Evaluation segment** of the final report, specifically the "Description of how code was tested" requirement. Moving forward, we will continue to recruit new testers to maintain high usability standards.
class ScoreEntry {
    constructor(playerName, score, levelsCompleted = 0, difficulty = "easy", playerMode = "single", catchHistory = {}) {
        this.playerName = playerName;
        this.score = score;
        this.levelsCompleted = levelsCompleted;
        this.difficulty = (difficulty || "easy").toString().toLowerCase();
        this.playerMode = (playerMode || "single").toString().toLowerCase();
        this.catchHistory = catchHistory && typeof catchHistory === "object" ? catchHistory : {};
    }
}

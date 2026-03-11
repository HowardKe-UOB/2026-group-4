class ScoreEntry {
    constructor(playerName, score, levelsCompleted = 0, difficulty = "easy", playerMode = "single") {
        this.playerName = playerName;
        this.score = score;
        this.levelsCompleted = levelsCompleted;
        this.difficulty = (difficulty || "easy").toString().toLowerCase();
        this.playerMode = (playerMode || "single").toString().toLowerCase();
    }
}

class HighScoreManager {
    constructor() {
        this.topScores = [];
        this.loadScores();
    }

    loadScores() {
        let saved = localStorage.getItem("deepSeaHighScores");
        if (saved) {
            this.topScores = JSON.parse(saved);
        } else {
            this.topScores = [
                new ScoreEntry("AAA", 3000),
                new ScoreEntry("BBB", 2000),
                new ScoreEntry("CCC", 1000),
            ];
        }
    }

    saveScores() {
        localStorage.setItem(
            "deepSeaHighScores",
            JSON.stringify(this.topScores),
        );
    }

    checkNewHighScore(score, name) {
        this.topScores.push(new ScoreEntry(name, score));
        this.topScores.sort((a, b) => b.score - a.score);
        this.topScores = this.topScores.slice(0, 5); // 只保留前五名
        this.saveScores();
    }
}

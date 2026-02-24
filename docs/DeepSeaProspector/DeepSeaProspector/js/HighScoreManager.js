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
                new ScoreEntry("DDD", 800),
                new ScoreEntry("EEE", 600),
                new ScoreEntry("FFF", 500),
                new ScoreEntry("GGG", 400),
                new ScoreEntry("HHH", 300),
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
        this.topScores = this.topScores.slice(0, 50);
        this.saveScores();
    }
}

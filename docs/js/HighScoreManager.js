class HighScoreManager {
    constructor() {
        this.topScores = [];
        this.loadScores();
    }

    loadScores() {
        let saved = localStorage.getItem("deepSeaHighScores");
        if (saved) {
            let parsed = JSON.parse(saved);
            this.topScores = parsed.map(
                (e) =>
                    new ScoreEntry(
                        e.playerName,
                        e.score,
                        e.levelsCompleted ?? 0,
                    ),
            );
        } else {
            this.topScores = [
                new ScoreEntry("AAA", 3000, 5),
                new ScoreEntry("BBB", 2000, 4),
                new ScoreEntry("CCC", 1000, 3),
                new ScoreEntry("DDD", 800, 2),
                new ScoreEntry("EEE", 600, 2),
                new ScoreEntry("FFF", 500, 1),
                new ScoreEntry("GGG", 400, 1),
                new ScoreEntry("HHH", 300, 1),
            ];
        }
        this.fetchFromSupabase();
    }

    saveScores() {
        localStorage.setItem(
            "deepSeaHighScores",
            JSON.stringify(this.topScores),
        );
    }

    checkNewHighScore(score, name, levelsCompleted = 0) {
        let entry = new ScoreEntry(name, score, levelsCompleted);
        this.topScores.push(entry);
        this.topScores.sort((a, b) => b.score - a.score);
        this.topScores = this.topScores.slice(0, 50);
        this.saveScores();
        this.submitToSupabase(score, name, levelsCompleted);
    }

    async fetchFromSupabase() {
        const cfg =
            typeof SUPABASE_CONFIG !== "undefined" ? SUPABASE_CONFIG : null;
        if (!cfg || !cfg.url || !cfg.anonKey || cfg.url.includes("YOUR_")) {
            return;
        }
        try {
            const res = await fetch(
                `${cfg.url}/rest/v1/scores?order=score.desc&limit=50`,
                {
                    headers: {
                        apikey: cfg.anonKey,
                        Authorization: `Bearer ${cfg.anonKey}`,
                    },
                },
            );
            if (!res.ok) return;
            const rows = await res.json();
            this.topScores = rows.map(
                (r) =>
                    new ScoreEntry(
                        r.player_name,
                        r.score,
                        r.levels_completed ?? 0,
                    ),
            );
            this.saveScores();
        } catch (e) {
            console.warn("Supabase fetch failed:", e);
        }
    }

    async submitToSupabase(score, name, levelsCompleted) {
        const cfg =
            typeof SUPABASE_CONFIG !== "undefined" ? SUPABASE_CONFIG : null;
        if (!cfg || !cfg.url || !cfg.anonKey || cfg.url.includes("YOUR_")) {
            return;
        }
        try {
            await fetch(`${cfg.url}/rest/v1/scores`, {
                method: "POST",
                headers: {
                    apikey: cfg.anonKey,
                    Authorization: `Bearer ${cfg.anonKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    player_name: name,
                    score: score,
                    levels_completed: levelsCompleted,
                }),
            });
        } catch (e) {
            console.warn("Supabase submit failed:", e);
        }
    }
}

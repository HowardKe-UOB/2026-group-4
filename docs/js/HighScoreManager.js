// Only access cloud leaderboard on production URL; use localStorage elsewhere.
const PROD_URL = "https://uob-comsm0166.github.io/2026-group-4/";
function isProdOrigin() {
    try {
        const h = window.location.hostname;
        const p = window.location.pathname;
        return h === "uob-comsm0166.github.io" && p.startsWith("/2026-group-4");
    } catch (_) {
        return false;
    }
}

class HighScoreManager {
    constructor() {
        this.topScores = [];
        this.isLoadingMore = false;
        this.hasMoreScores = false;
        this.hasFetchedMore = false;
        this.loadScores();
    }

    loadScores() {
        // Bootstrap from local cache first for fast startup and offline fallback.
        let saved = localStorage.getItem("deepSeaHighScores");
        if (saved) {
            let parsed = JSON.parse(saved);
            this.topScores = parsed.map(
                (e) =>
                    new ScoreEntry(
                        e.playerName,
                        e.score,
                        e.levelsCompleted ?? 0,
                        e.difficulty ?? "easy",
                        e.playerMode ?? "single",
                        e.catchHistory ?? {},
                        e.perLevelEarned ?? e.per_level_earned ?? [],
                        e.perLevelSpawnValue ?? e.per_level_spawn_value ?? [],
                    ),
            );
            this._sortScores();
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
            this._sortScores();
        }
        // Then refresh with cloud data when available.
        this.fetchFromSupabase();
    }

    _sortScores() {
        this.topScores.sort((a, b) => {
            if (b.levelsCompleted !== a.levelsCompleted) return b.levelsCompleted - a.levelsCompleted;
            return b.score - a.score;
        });
    }

    saveScores() {
        localStorage.setItem(
            "deepSeaHighScores",
            JSON.stringify(this.topScores),
        );
    }

    checkNewHighScore(
        score,
        name,
        levelsCompleted = 0,
        difficulty = "easy",
        playerMode = "single",
        catchHistory = {},
        perLevelEarned = null,
        perLevelSpawnValue = null,
    ) {
        let entry = new ScoreEntry(
            name,
            score,
            levelsCompleted,
            difficulty,
            playerMode,
            catchHistory,
            perLevelEarned,
            perLevelSpawnValue,
        );
        this.topScores.push(entry);
        this._sortScores();
        this.topScores = this.topScores.slice(0, 50);
        this.saveScores();
        this.submitToSupabase(
            score,
            name,
            levelsCompleted,
            difficulty,
            playerMode,
            catchHistory,
            entry.perLevelEarned,
            entry.perLevelSpawnValue,
        );
    }

    async fetchFromSupabase() {
        if (!isProdOrigin()) return;
        const cfg =
            typeof SUPABASE_CONFIG !== "undefined" ? SUPABASE_CONFIG : null;
        if (!cfg || !cfg.url || !cfg.anonKey || cfg.url.includes("YOUR_")) {
            return;
        }
        this.hasMoreScores = false;
        try {
            const res = await fetch(
                `${cfg.url}/rest/v1/scores?order=levels_completed.desc,score.desc&limit=50&offset=0`,
                {
                    headers: {
                        apikey: cfg.anonKey,
                        Authorization: `Bearer ${cfg.anonKey}`,
                    },
                },
            );
            if (!res.ok) return;
            const rows = await res.json();
            if (this.hasFetchedMore || this.topScores.length > 50) return;
            this.topScores = rows.map(
                (r) =>
                    new ScoreEntry(
                        r.player_name,
                        r.score,
                        r.levels_completed ?? 0,
                        r.difficulty ?? "easy",
                        r.player_mode ?? "single",
                        r.catch_history ?? {},
                        r.per_level_earned ?? [],
                        r.per_level_spawn_value ?? [],
                    ),
            );
            this._sortScores();
            this.hasMoreScores = rows.length >= 50;
            this.saveScores();
        } catch (e) {
            console.warn("Supabase fetch failed:", e);
        }
    }

    async fetchMoreFromSupabase() {
        if (!isProdOrigin() || this.isLoadingMore || !this.hasMoreScores) return;
        const cfg =
            typeof SUPABASE_CONFIG !== "undefined" ? SUPABASE_CONFIG : null;
        if (!cfg || !cfg.url || !cfg.anonKey || cfg.url.includes("YOUR_")) {
            return;
        }
        this.isLoadingMore = true;
        // Pagination uses current loaded count as the next offset.
        const offset = this.topScores.length;
        try {
            const res = await fetch(
                `${cfg.url}/rest/v1/scores?order=levels_completed.desc,score.desc&limit=50&offset=${offset}`,
                {
                    headers: {
                        apikey: cfg.anonKey,
                        Authorization: `Bearer ${cfg.anonKey}`,
                    },
                },
            );
            if (!res.ok) {
                this.isLoadingMore = false;
                return;
            }
            const rows = await res.json();
            const newEntries = rows.map(
                (r) =>
                    new ScoreEntry(
                        r.player_name,
                        r.score,
                        r.levels_completed ?? 0,
                        r.difficulty ?? "easy",
                        r.player_mode ?? "single",
                        r.catch_history ?? {},
                        r.per_level_earned ?? [],
                        r.per_level_spawn_value ?? [],
                    ),
            );
            const prevLen = this.topScores.length;
            this.topScores = this.topScores.concat(newEntries);
            this.hasMoreScores = rows.length >= 50;
            this.hasFetchedMore = true;
            this.saveScores();
            this._scrollAfterLoadMore = prevLen > 0 ? prevLen * 58 : 0;
        } catch (e) {
            console.warn("Supabase fetch more failed:", e);
        } finally {
            this.isLoadingMore = false;
        }
    }

    async submitToSupabase(
        score,
        name,
        levelsCompleted,
        difficulty = "easy",
        playerMode = "single",
        catchHistory = {},
        perLevelEarned = [],
        perLevelSpawnValue = [],
    ) {
        if (!isProdOrigin()) return;
        const cfg =
            typeof SUPABASE_CONFIG !== "undefined" ? SUPABASE_CONFIG : null;
        if (!cfg || !cfg.url || !cfg.anonKey || cfg.url.includes("YOUR_")) {
            return;
        }
        const d = (difficulty || "easy").toString().toLowerCase();
        const p = (playerMode || "single").toString().toLowerCase();
        const ch = catchHistory && typeof catchHistory === "object" ? catchHistory : {};
        // Supabase `scores` table must include jsonb columns:
        // `per_level_earned` and `per_level_spawn_value`.
        const ple = Array.isArray(perLevelEarned) ? perLevelEarned : [];
        const pls = Array.isArray(perLevelSpawnValue) ? perLevelSpawnValue : [];
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
                    difficulty: d,
                    player_mode: p,
                    catch_history: ch,
                    per_level_earned: ple,
                    per_level_spawn_value: pls,
                }),
            });
        } catch (e) {
            console.warn("Supabase submit failed:", e);
        }
    }
}

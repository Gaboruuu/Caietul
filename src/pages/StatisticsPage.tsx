import { faker } from "@faker-js/faker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/StatisticsPage.module.css";
import { calculateKda, formatDuration, matchStore } from "../store/matchStore";
import type { Match, Result, Role } from "../types/match";

type SortKey = "result" | "kda" | "cs" | "vision" | "score";

const PAGE_SIZE = 10;

const ROLE_ORDER: Role[] = ["Mid", "Jungle", "Bot", "Top", "Support"];

const ROLE_COLORS: Record<Role, string> = {
  Mid: "#4F6EF7",
  Jungle: "#7C3AED",
  Bot: "#22C55E",
  Top: "#F59E0B",
  Support: "#EF4444",
};

const CHAMPION_ICONS: Record<string, string> = {
  yasuo: "⚔️",
  zed: "🗡️",
  ahri: "🦊",
  "lee sin": "🐉",
  jinx: "💥",
  maokai: "🌿",
  lissandra: "❄️",
};

const championIcon = (name: string): string =>
  CHAMPION_ICONS[name.trim().toLowerCase()] ?? "🎮";

const FAKER_CHAMPIONS = [
  "Yasuo",
  "Zed",
  "Ahri",
  "Lee Sin",
  "Jinx",
  "Maokai",
  "Lissandra",
  "Orianna",
  "Kai'Sa",
  "Thresh",
  "Viego",
  "Aatrox",
  "Riven",
  "Talon",
  "Caitlyn",
];

const PATCH_POOL = ["14.7", "14.8", "14.9", "14.10", "14.11", "14.12"];

const createFakeMatch = (): Omit<Match, "id"> => {
  const duration = faker.number.int({ min: 900, max: 2700 });
  const csPerMinute = faker.number.int({ min: 4, max: 10 });
  const resultRoll = faker.number.int({ min: 1, max: 100 });
  const result: Result =
    resultRoll <= 53 ? "Victory" : resultRoll <= 95 ? "Defeat" : "Remake";

  return {
    champion: faker.helpers.arrayElement(FAKER_CHAMPIONS),
    role: faker.helpers.arrayElement(ROLE_ORDER),
    result,
    kills: faker.number.int({ min: 0, max: 20 }),
    deaths: faker.number.int({ min: 0, max: 14 }),
    assists: faker.number.int({ min: 1, max: 25 }),
    cs: Math.round((duration / 60) * csPerMinute),
    visionScore: faker.number.int({ min: 8, max: 75 }),
    duration,
    date: faker.date.recent({ days: 45 }).toISOString(),
    patch: faker.helpers.arrayElement(PATCH_POOL),
    notes: "faker-test-data",
  };
};

const scoreForMatch = (match: Match): number => {
  const kda = (match.kills + match.assists) / Math.max(1, match.deaths);
  const csPerMin = match.cs / Math.max(1, match.duration / 60);
  const visionPerMin = match.visionScore / Math.max(1, match.duration / 60);

  const kdaPart = Math.min(1, kda / 5.5) * 40;
  const csPart = Math.min(1, csPerMin / 8.0) * 25;
  const visionPart = Math.min(1, visionPerMin / 2.0) * 20;
  const resultPart =
    match.result === "Victory" ? 15 : match.result === "Defeat" ? -5 : 0;

  return Math.max(
    0,
    Math.min(100, Math.round(kdaPart + csPart + visionPart + resultPart)),
  );
};

const trendDates = (items: Match[]): string[] =>
  items.map((match) =>
    new Date(match.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  );

export default function StatisticsPage() {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [currentPage, setCurrentPage] = useState(1);
  const [isChartUpdating, setIsChartUpdating] = useState(false);
  const [allMatches, setAllMatches] = useState<Match[]>(() =>
    matchStore.getAll().slice(0, 25),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const generatorRef = useRef<number | null>(null);
  const fakerIdsRef = useRef<Set<string>>(new Set());
  const hasMountedRef = useRef(false);

  const refreshMatches = useCallback(() => {
    setAllMatches(matchStore.getAll().slice(0, 25));
  }, []);

  const addFakerMatch = useCallback(() => {
    const created = matchStore.add(createFakeMatch());
    fakerIdsRef.current.add(created.id);
    refreshMatches();
  }, [refreshMatches]);

  const clearGenerator = useCallback(() => {
    if (generatorRef.current !== null) {
      window.clearInterval(generatorRef.current);
      generatorRef.current = null;
    }
  }, []);

  const handleToggleGenerator = () => {
    setIsGenerating((value) => !value);
  };

  const handleDeleteFakerData = () => {
    setIsGenerating(false);

    fakerIdsRef.current.forEach((id) => {
      matchStore.delete(id);
    });

    fakerIdsRef.current.clear();
    refreshMatches();
  };

  useEffect(() => {
    if (!isGenerating) {
      clearGenerator();
      return;
    }

    addFakerMatch();
    generatorRef.current = window.setInterval(() => {
      addFakerMatch();
    }, 1200);

    return clearGenerator;
  }, [addFakerMatch, clearGenerator, isGenerating]);

  const rows = useMemo(() => {
    return allMatches.map((match) => {
      const score = scoreForMatch(match);
      const kdaNumeric =
        (match.kills + match.assists) / Math.max(1, match.deaths);

      return {
        match,
        score,
        kdaNumeric,
        kdaLabel: calculateKda(match.kills, match.deaths, match.assists),
      };
    });
  }, [allMatches]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setIsChartUpdating(true);
    const timer = window.setTimeout(() => {
      setIsChartUpdating(false);
    }, 520);

    return () => {
      window.clearTimeout(timer);
    };
  }, [allMatches]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows];

    sorted.sort((a, b) => {
      if (sortKey === "result") {
        const order: Record<Result, number> = {
          Victory: 2,
          Defeat: 1,
          Remake: 0,
        };

        return order[b.match.result] - order[a.match.result];
      }

      if (sortKey === "kda") {
        return b.kdaNumeric - a.kdaNumeric;
      }

      if (sortKey === "cs") {
        return b.match.cs - a.match.cs;
      }

      if (sortKey === "vision") {
        return b.match.visionScore - a.match.visionScore;
      }

      return b.score - a.score;
    });

    return sorted;
  }, [rows, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const pagedRows = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedRows.slice(start, start + PAGE_SIZE);
  }, [currentPage, sortedRows, totalPages]);

  const summary = useMemo(() => {
    const total = rows.length;

    if (total === 0) {
      return {
        total,
        winRate: 0,
        avgScore: 0,
        avgKda: 0,
        avgCsMin: 0,
        tiltGames: 0,
      };
    }

    const wins = rows.filter((row) => row.match.result === "Victory").length;
    const avgScore = rows.reduce((sum, row) => sum + row.score, 0) / total;
    const avgKda = rows.reduce((sum, row) => sum + row.kdaNumeric, 0) / total;
    const avgCsMin =
      rows.reduce(
        (sum, row) => sum + row.match.cs / Math.max(1, row.match.duration / 60),
        0,
      ) / total;
    const tiltGames = rows.filter((row) => row.score < 75).length;

    return {
      total,
      winRate: (wins / total) * 100,
      avgScore,
      avgKda,
      avgCsMin,
      tiltGames,
    };
  }, [rows]);

  const roleDistribution = useMemo(() => {
    const total = rows.length;

    return ROLE_ORDER.map((role) => {
      const count = rows.filter((row) => row.match.role === role).length;
      return {
        role,
        count,
        pct: total > 0 ? (count / total) * 100 : 0,
      };
    });
  }, [rows]);

  const roleConicGradient = useMemo(() => {
    const parts = roleDistribution.reduce<{ start: number; parts: string[] }>(
      (acc, item) => {
        const end = acc.start + item.pct;
        return {
          start: end,
          parts: [
            ...acc.parts,
            `${ROLE_COLORS[item.role]} ${acc.start}% ${end}%`,
          ],
        };
      },
      { start: 0, parts: [] },
    ).parts;

    if (parts.length === 0) {
      return "#4F6EF7";
    }

    return `conic-gradient(${parts.join(",")})`;
  }, [roleDistribution]);

  const trendData = useMemo(() => {
    const latestTen = [...rows].slice(0, 10).reverse();
    return {
      scores: latestTen.map((item) => item.score),
      results: latestTen.map((item) => item.match.result),
      labels: trendDates(latestTen.map((item) => item.match)),
    };
  }, [rows]);

  const championStats = useMemo(() => {
    const map = new Map<
      string,
      {
        champion: string;
        role: Role;
        games: number;
        wins: number;
        totalScore: number;
      }
    >();

    rows.forEach((row) => {
      const key = row.match.champion.toLowerCase();
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          champion: row.match.champion,
          role: row.match.role,
          games: 1,
          wins: row.match.result === "Victory" ? 1 : 0,
          totalScore: row.score,
        });
        return;
      }

      existing.games += 1;
      existing.totalScore += row.score;
      if (row.match.result === "Victory") {
        existing.wins += 1;
      }
    });

    return Array.from(map.values()).map((item) => ({
      ...item,
      winRate: item.games > 0 ? (item.wins / item.games) * 100 : 0,
      avgScore: item.games > 0 ? item.totalScore / item.games : 0,
    }));
  }, [rows]);

  const winRateByChampion = useMemo(() => {
    return [...championStats]
      .filter((item) => item.games >= 1)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 6);
  }, [championStats]);

  const wins = rows.filter((row) => row.match.result === "Victory").length;
  const losses = rows.filter((row) => row.match.result === "Defeat").length;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Statistics</h1>
            <p>Season 2026 · Last 25 ranked games · ShadowBlade#EUW</p>
          </div>
          <div className={styles.fakerControls}>
            <button
              type="button"
              className={`${styles.controlBtn} ${isGenerating ? styles.stopBtn : styles.startBtn}`}
              onClick={handleToggleGenerator}
            >
              {isGenerating ? "Stop Faker Feed" : "Start Faker Feed"}
            </button>
            <button
              type="button"
              className={`${styles.controlBtn} ${styles.clearBtn}`}
              onClick={handleDeleteFakerData}
              disabled={fakerIdsRef.current.size === 0}
            >
              Delete Faker Data
            </button>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Avg Score</div>
            <div className={`${styles.summaryValue} ${styles.neutral}`}>
              {summary.avgScore.toFixed(1)}
            </div>
            <div className={`${styles.summaryDelta} ${styles.up}`}>
              Live from your match log
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Win Rate</div>
            <div className={`${styles.summaryValue} ${styles.up}`}>
              {summary.winRate.toFixed(1)}%
            </div>
            <div className={`${styles.summaryDelta} ${styles.up}`}>
              {wins} wins out of {summary.total}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Avg KDA</div>
            <div className={styles.summaryValue}>
              {summary.avgKda.toFixed(1)}
            </div>
            <div className={`${styles.summaryDelta} ${styles.up}`}>
              Calculated across all matches
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Avg CS/min</div>
            <div className={styles.summaryValue}>
              {summary.avgCsMin.toFixed(1)}
            </div>
            <div className={`${styles.summaryDelta} ${styles.neutral}`}>
              Farm trend indicator
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Tilt Games</div>
            <div className={`${styles.summaryValue} ${styles.down}`}>
              {summary.tiltGames}
            </div>
            <div className={`${styles.summaryDelta} ${styles.down}`}>
              {losses} losses tracked this split
            </div>
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          <section className={styles.visualColumn}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Visual insights</h2>
                <p className={styles.sectionSub}>
                  Charts, trends and champion breakdowns in one column.
                </p>
              </div>
            </div>

            <div
              className={`${styles.chartsGrid} ${isChartUpdating ? styles.chartsGridUpdating : ""}`}
            >
              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>Win / Loss Ratio</div>
                <div className={styles.chartSub}>Last 25 ranked games</div>
                <div className={styles.pieWrap}>
                  <div
                    className={styles.pie}
                    style={{
                      background: `conic-gradient(#4ade80 0% ${summary.winRate}%, #f87171 ${summary.winRate}% 100%)`,
                    }}
                  >
                    <div className={styles.pieHole}>
                      <div className={styles.pieHoleVal}>
                        {summary.winRate.toFixed(0)}%
                      </div>
                      <div className={styles.pieHoleLabel}>Win Rate</div>
                    </div>
                  </div>
                  <div className={styles.pieLegend}>
                    <div className={styles.legendItem}>
                      <div
                        className={styles.legendDot}
                        style={{ background: "#4ade80" }}
                      />
                      <div className={styles.legendLabel}>Victories</div>
                      <div className={`${styles.legendVal} ${styles.up}`}>
                        {wins}
                      </div>
                    </div>
                    <div className={styles.legendItem}>
                      <div
                        className={styles.legendDot}
                        style={{ background: "#f87171" }}
                      />
                      <div className={styles.legendLabel}>Defeats</div>
                      <div className={`${styles.legendVal} ${styles.down}`}>
                        {losses}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>Role Distribution</div>
                <div className={styles.chartSub}>Games played by position</div>
                <div className={styles.pieWrap}>
                  <div
                    className={`${styles.pie} ${styles.pieRole}`}
                    style={{ background: roleConicGradient }}
                  >
                    <div className={styles.pieHole}>
                      <div className={styles.pieHoleValSmall}>Roles</div>
                    </div>
                  </div>
                  <div className={styles.pieLegend}>
                    {roleDistribution.map((item) => (
                      <div className={styles.legendItem} key={item.role}>
                        <div
                          className={styles.legendDot}
                          style={{ background: ROLE_COLORS[item.role] }}
                        />
                        <div className={styles.legendLabel}>{item.role}</div>
                        <div
                          className={`${styles.legendVal} ${styles.neutral}`}
                        >
                          {item.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`${styles.chartCard} ${styles.wide}`}>
                <div className={styles.chartTitle}>
                  Performance Score — Last 10 Games
                </div>
                <div className={styles.chartSub}>
                  Higher is better · Green = win · Red = loss
                </div>

                <div className={styles.trendBars}>
                  {trendData.scores.map((score, index) => (
                    <div className={styles.trendBarCol} key={`trend-${index}`}>
                      <span className={styles.trendScore}>{score}</span>
                      <div className={styles.trendTrack}>
                        <div
                          className={styles.trendFill}
                          style={{
                            height: `${score}%`,
                            background:
                              trendData.results[index] === "Victory"
                                ? "rgba(74,222,128,0.65)"
                                : "rgba(239,68,68,0.65)",
                          }}
                        />
                      </div>
                      <span className={styles.trendLabel}>
                        {trendData.labels[index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${styles.chartCard} ${styles.wide}`}>
                <div className={styles.chartTitle}>Win Rate by Champion</div>
                <div className={styles.chartSub}>
                  Tracked champions in your data
                </div>
                <div className={styles.championBars}>
                  {winRateByChampion.map((item) => {
                    const barTone =
                      item.winRate >= 55
                        ? "rgba(74,222,128,0.75)"
                        : item.winRate >= 45
                          ? "rgba(251,191,36,0.75)"
                          : "rgba(248,113,113,0.75)";

                    return (
                      <div
                        className={styles.championBarCol}
                        key={item.champion}
                      >
                        <span className={styles.championBarScore}>
                          {item.winRate.toFixed(0)}%
                        </span>
                        <div className={styles.championBarTrack}>
                          <div
                            className={styles.championBarFill}
                            style={{
                              height: `${item.winRate}%`,
                              background: barTone,
                            }}
                          />
                        </div>
                        <div className={styles.championBarLabel}>
                          {item.champion}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.tableColumn}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Tabular breakdown</h2>
                <p className={styles.sectionSub}>
                  Sort by result, KDA, CS, vision or score.
                </p>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Champion</th>
                    <th
                      className={styles.sortable}
                      onClick={() => setSortKey("result")}
                    >
                      Result ↕
                    </th>
                    <th
                      className={styles.sortable}
                      onClick={() => setSortKey("kda")}
                    >
                      KDA ↕
                    </th>
                    <th
                      className={styles.sortable}
                      onClick={() => setSortKey("cs")}
                    >
                      CS ↕
                    </th>
                    <th
                      className={styles.sortable}
                      onClick={() => setSortKey("vision")}
                    >
                      Vision ↕
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length > 0 ? (
                    pagedRows.map((row) => (
                      <tr key={row.match.id}>
                        <td data-label="Champion">
                          <div className={styles.champCell}>
                            <div className={styles.champIcon}>
                              {championIcon(row.match.champion)}
                            </div>
                            <div>
                              <div className={styles.champName}>
                                {row.match.champion}
                              </div>
                              <div className={styles.champRole}>
                                {row.match.role} ·{" "}
                                {formatDuration(row.match.duration)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Result">
                          <span
                            className={`${styles.pill} ${row.match.result === "Victory" ? styles.win : styles.loss}`}
                          >
                            {row.match.result === "Victory"
                              ? "Win"
                              : row.match.result === "Defeat"
                                ? "Loss"
                                : "Remake"}
                          </span>
                        </td>
                        <td data-label="KDA">
                          {row.match.kills}/{row.match.deaths}/
                          {row.match.assists}{" "}
                          <span className={styles.kdaSub}>
                            ({row.kdaLabel})
                          </span>
                        </td>
                        <td data-label="CS">{row.match.cs}</td>
                        <td data-label="Vision">{row.match.visionScore}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={styles.emptyState}>
                        No matches available. Start Faker Feed to generate test
                        rows.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * PAGE_SIZE + 1,
                    sortedRows.length,
                  )}
                  -{Math.min(currentPage * PAGE_SIZE, sortedRows.length)} of{" "}
                  {sortedRows.length} matches
                </div>
                <div className={styles.paginationControls}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        type="button"
                        key={page}
                        className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

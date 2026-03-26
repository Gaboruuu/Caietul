import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "../styles/MatchHomePage.module.css";
import { matchStore, formatDuration } from "../store/matchStore";
import type { Match } from "../types/match";

const PAGE_SIZE = 10;

export default function MatchHomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageData, setPageData] = useState<{
    items: Match[];
    total: number;
    totalPages: number;
  }>({ items: [], total: 0, totalPages: 0 });

  useEffect(() => {
    const data = matchStore.getPage(currentPage, PAGE_SIZE);
    setPageData(data);
  }, [currentPage]);

  return (
    <>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>C</div>
          <span className={styles.logoText}>Caietul</span>
        </Link>
        <div className={styles.navRight}>
          <div className={styles.summonerBadge}>
            ⚔️ ShadowBlade#EUW
            <span className={styles.rankPill}>Diamond III</span>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.profileTop}>
                <div className={styles.avatar}>🗡️</div>
                <div className={styles.profileName}>ShadowBlade</div>
                <div className={styles.profileTag}>#EUW</div>
                <div className={styles.profileMeta}>
                  <span className={`${styles.metaPill} ${styles.level}`}>
                    Level 247
                  </span>
                  <span className={`${styles.metaPill} ${styles.server}`}>
                    EUW
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                <span>54.2% WR overall</span>
                <span>
                  Score avg <strong style={{ color: "#a5b4fc" }}>78</strong>
                </span>
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <div className={styles.sectionLabel}>Ranked</div>

              <div className={styles.rankBlock}>
                <div className={styles.rankIcon}>💎</div>
                <div className={styles.rankInfo}>
                  <div className={styles.rankType}>Solo / Duo</div>
                  <div className={styles.rankName}>Diamond III</div>
                  <div className={styles.rankLp}>67 LP</div>
                  <div className={styles.rankWl}>
                    <span className={styles.wlWins}>134W</span>
                    <span className={styles.wlSep}>/</span>
                    <span className={styles.wlLosses}>114L</span>
                    <span className={styles.wlWr}>54.1%</span>
                  </div>
                </div>
              </div>

              <div className={styles.rankBlock}>
                <div
                  className={styles.rankIcon}
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(167,139,250,0.15),rgba(124,58,237,0.15))",
                    borderColor: "rgba(167,139,250,0.2)",
                  }}
                >
                  💎
                </div>
                <div className={styles.rankInfo}>
                  <div className={styles.rankType}>Flex 5v5</div>
                  <div className={styles.rankName}>Platinum I</div>
                  <div className={styles.rankLp}>88 LP</div>
                  <div className={styles.rankWl}>
                    <span className={styles.wlWins}>62W</span>
                    <span className={styles.wlSep}>/</span>
                    <span className={styles.wlLosses}>58L</span>
                    <span className={styles.wlWr}>51.7%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <div className={styles.sectionLabel}>Most Played</div>

              <div className={styles.champRow}>
                <div
                  className={styles.champMiniIcon}
                  style={{ background: "rgba(255,200,50,0.12)" }}
                >
                  ⚔️
                </div>
                <div>
                  <div className={styles.champMiniName}>Yasuo</div>
                  <div className={styles.champMiniSub}>Mid · 48 games</div>
                </div>
                <div>
                  <div className={`${styles.champMiniWr} ${styles.wrGood}`}>
                    58%
                  </div>
                  <div className={styles.champMiniGames}>4.1 KDA</div>
                </div>
              </div>

              <div className={styles.champRow}>
                <div
                  className={styles.champMiniIcon}
                  style={{ background: "rgba(200,100,255,0.12)" }}
                >
                  🦊
                </div>
                <div>
                  <div className={styles.champMiniName}>Ahri</div>
                  <div className={styles.champMiniSub}>Mid · 34 games</div>
                </div>
                <div>
                  <div className={`${styles.champMiniWr} ${styles.wrGood}`}>
                    62%
                  </div>
                  <div className={styles.champMiniGames}>5.3 KDA</div>
                </div>
              </div>

              <div className={styles.champRow}>
                <div
                  className={styles.champMiniIcon}
                  style={{ background: "rgba(100,100,100,0.18)" }}
                >
                  🗡️
                </div>
                <div>
                  <div className={styles.champMiniName}>Zed</div>
                  <div className={styles.champMiniSub}>Mid · 27 games</div>
                </div>
                <div>
                  <div className={`${styles.champMiniWr} ${styles.wrOk}`}>
                    48%
                  </div>
                  <div className={styles.champMiniGames}>3.2 KDA</div>
                </div>
              </div>

              <div className={styles.champRow}>
                <div
                  className={styles.champMiniIcon}
                  style={{ background: "rgba(255,150,50,0.12)" }}
                >
                  🐉
                </div>
                <div>
                  <div className={styles.champMiniName}>Lee Sin</div>
                  <div className={styles.champMiniSub}>Jungle · 19 games</div>
                </div>
                <div>
                  <div className={`${styles.champMiniWr} ${styles.wrBad}`}>
                    42%
                  </div>
                  <div className={styles.champMiniGames}>3.8 KDA</div>
                </div>
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <div className={styles.sectionLabel}>Champion Mastery</div>

              <div className={styles.masteryRow}>
                <div
                  className={styles.masteryIcon}
                  style={{ background: "rgba(255,200,50,0.12)" }}
                >
                  ⚔️
                </div>
                <div>
                  <div className={styles.masteryName}>Yasuo</div>
                  <div className={styles.masteryPts}>412,800 pts</div>
                </div>
                <div className={`${styles.masteryBadge} ${styles.m7}`}>7</div>
              </div>

              <div className={styles.masteryRow}>
                <div
                  className={styles.masteryIcon}
                  style={{ background: "rgba(200,100,255,0.12)" }}
                >
                  🦊
                </div>
                <div>
                  <div className={styles.masteryName}>Ahri</div>
                  <div className={styles.masteryPts}>284,500 pts</div>
                </div>
                <div className={`${styles.masteryBadge} ${styles.m7}`}>7</div>
              </div>

              <div className={styles.masteryRow}>
                <div
                  className={styles.masteryIcon}
                  style={{ background: "rgba(100,100,100,0.18)" }}
                >
                  🗡️
                </div>
                <div>
                  <div className={styles.masteryName}>Zed</div>
                  <div className={styles.masteryPts}>198,200 pts</div>
                </div>
                <div className={`${styles.masteryBadge} ${styles.m6}`}>6</div>
              </div>

              <div className={styles.masteryRow}>
                <div
                  className={styles.masteryIcon}
                  style={{ background: "rgba(255,150,50,0.12)" }}
                >
                  🐉
                </div>
                <div>
                  <div className={styles.masteryName}>Lee Sin</div>
                  <div className={styles.masteryPts}>134,100 pts</div>
                </div>
                <div className={`${styles.masteryBadge} ${styles.m5}`}>5</div>
              </div>
            </div>
          </aside>

          <div>
            <div className={styles.pageHeader}>
              <div>
                <h1>Match History</h1>
                <p>Your last 25 ranked games · Season 2026</p>
              </div>
              <Link to="/matches/new" className={styles.btnAdd}>
                + Add Match
              </Link>
            </div>

            <div className={styles.filters}>
              <div className={styles.searchBox}>
                <input type="text" placeholder="Search champion..." />
              </div>
              <button className={`${styles.filterBtn} ${styles.active}`}>
                All
              </button>
              <button className={styles.filterBtn}>Wins</button>
              <button className={styles.filterBtn}>Losses</button>
              <button className={styles.filterBtn}>Mid</button>
              <button className={styles.filterBtn}>Jungle</button>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Champion</th>
                    <th>Result</th>
                    <th>KDA</th>
                    <th>CS</th>
                    <th>Duration</th>
                    <th>Date</th>
                    <th>Vision</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.items.map((match) => (
                    <tr key={match.id}>
                      <td>
                        <div className={styles.champCell}>
                          <div className={styles.champAvatar}>
                            {match.champion.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.champName}>
                              {match.champion}
                            </div>
                            <div className={styles.champRole}>{match.role}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.winPill} ${
                            match.result === "Victory"
                              ? styles.win
                              : styles.loss
                          }`}
                        >
                          {match.result}
                        </span>
                      </td>
                      <td className={styles.kda}>
                        {match.kills}
                        <span>/</span>
                        {match.deaths}
                        <span>/</span>
                        {match.assists}
                      </td>
                      <td>{match.cs}</td>
                      <td>{formatDuration(match.duration)}</td>
                      <td>{new Date(match.date).toLocaleDateString()}</td>
                      <td>{match.visionScore}</td>
                      <td>
                        <div className={styles.actions}>
                          <Link
                            to={`/matches/${match.id}`}
                            className={`${styles.actionBtn} ${styles.btnView}`}
                          >
                            View
                          </Link>
                          <Link
                            to={`/matches/${match.id}/edit`}
                            className={`${styles.actionBtn} ${styles.btnEdit}`}
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/matches/${match.id}/delete`}
                            className={`${styles.actionBtn} ${styles.btnDelete}`}
                          >
                            Delete
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                  Showing{" "}
                  {Math.min((currentPage - 1) * PAGE_SIZE + 1, pageData.total)}–
                  {Math.min(currentPage * PAGE_SIZE, pageData.total)} of{" "}
                  {pageData.total} matches
                </div>
                <div className={styles.paginationControls}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    ←
                  </button>
                  {Array.from({ length: pageData.totalPages }, (_, i) => i + 1)
                    .slice(
                      Math.max(0, currentPage - 2),
                      Math.min(pageData.totalPages, currentPage + 2),
                    )
                    .map((page) => (
                      <button
                        key={page}
                        className={`${styles.pageBtn} ${
                          currentPage === page ? styles.active : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  <button
                    className={styles.pageBtn}
                    onClick={() =>
                      setCurrentPage(
                        Math.min(pageData.totalPages, currentPage + 1),
                      )
                    }
                    disabled={currentPage === pageData.totalPages}
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

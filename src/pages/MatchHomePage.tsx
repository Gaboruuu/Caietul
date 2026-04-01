import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "../styles/MatchHomePage.module.css";
import { matchStore, formatDuration } from "../store/matchStore";
import type { Match } from "../types/match";
import RankBlock from "../components/matchHome/RankBlock";
import ChampMiniRow from "../components/matchHome/ChampMiniRow";
import MasteryRow from "../components/matchHome/MasteryRow";

const PAGE_SIZE = 10;

const RANKED_QUEUES = [
  {
    queueType: "Solo / Duo",
    rankName: "Diamond III",
    lp: "67 LP",
    wins: "134W",
    losses: "114L",
    winRate: "54.1%",
    alt: false,
  },
  {
    queueType: "Flex 5v5",
    rankName: "Platinum I",
    lp: "88 LP",
    wins: "62W",
    losses: "58L",
    winRate: "51.7%",
    alt: true,
  },
] as const;

const MOST_PLAYED = [
  {
    icon: "⚔️",
    bgClass: styles.bgYasuo,
    name: "Yasuo",
    sub: "Mid · 48 games",
    wr: "58%",
    wrClass: styles.wrGood,
    kda: "4.1 KDA",
  },
  {
    icon: "🦊",
    bgClass: styles.bgAhri,
    name: "Ahri",
    sub: "Mid · 34 games",
    wr: "62%",
    wrClass: styles.wrGood,
    kda: "5.3 KDA",
  },
  {
    icon: "🗡️",
    bgClass: styles.bgZed,
    name: "Zed",
    sub: "Mid · 27 games",
    wr: "48%",
    wrClass: styles.wrOk,
    kda: "3.2 KDA",
  },
  {
    icon: "🐉",
    bgClass: styles.bgLeeSin,
    name: "Lee Sin",
    sub: "Jungle · 19 games",
    wr: "42%",
    wrClass: styles.wrBad,
    kda: "3.8 KDA",
  },
] as const;

const CHAMPION_MASTERY = [
  {
    icon: "⚔️",
    bgClass: styles.bgYasuo,
    name: "Yasuo",
    points: "412,800 pts",
    badge: "7",
    badgeClass: styles.m7,
  },
  {
    icon: "🦊",
    bgClass: styles.bgAhri,
    name: "Ahri",
    points: "284,500 pts",
    badge: "7",
    badgeClass: styles.m7,
  },
  {
    icon: "🗡️",
    bgClass: styles.bgZed,
    name: "Zed",
    points: "198,200 pts",
    badge: "6",
    badgeClass: styles.m6,
  },
  {
    icon: "🐉",
    bgClass: styles.bgLeeSin,
    name: "Lee Sin",
    points: "134,100 pts",
    badge: "5",
    badgeClass: styles.m5,
  },
] as const;

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
                  <span
                    className={`${styles.metaPill} ${styles.metaPillLevel}`}
                  >
                    Level 247
                  </span>
                  <span
                    className={`${styles.metaPill} ${styles.metaPillServer}`}
                  >
                    EUW
                  </span>
                </div>
              </div>
              <div className={styles.profileStats}>
                <span>54.2% WR overall</span>
                <span>
                  Score avg <strong>78</strong>
                </span>
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <div className={styles.sectionLabel}>Ranked</div>
              {RANKED_QUEUES.map((queue) => (
                <RankBlock
                  key={queue.queueType}
                  queueType={queue.queueType}
                  rankName={queue.rankName}
                  lp={queue.lp}
                  wins={queue.wins}
                  losses={queue.losses}
                  winRate={queue.winRate}
                  alt={queue.alt}
                />
              ))}
            </div>

            <div className={styles.sidebarCard}>
              <div className={styles.sectionLabel}>Most Played</div>
              {MOST_PLAYED.map((champion) => (
                <ChampMiniRow
                  key={champion.name}
                  icon={champion.icon}
                  bgClass={champion.bgClass}
                  name={champion.name}
                  sub={champion.sub}
                  wr={champion.wr}
                  wrClass={champion.wrClass}
                  kda={champion.kda}
                />
              ))}
            </div>

            <div className={styles.sidebarCard}>
              <div className={styles.sectionLabel}>Champion Mastery</div>
              {CHAMPION_MASTERY.map((champion) => (
                <MasteryRow
                  key={champion.name}
                  icon={champion.icon}
                  bgClass={champion.bgClass}
                  name={champion.name}
                  points={champion.points}
                  badge={champion.badge}
                  badgeClass={champion.badgeClass}
                />
              ))}
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
              <button
                className={`${styles.filterBtn} ${styles.filterBtnActive}`}
              >
                All
              </button>
              <button className={styles.filterBtn}>Wins</button>
              <button className={styles.filterBtn}>Losses</button>
              <button className={styles.filterBtn}>Mid</button>
              <button className={styles.filterBtn}>Jungle</button>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
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
                          currentPage === page ? styles.pageBtnActive : ""
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

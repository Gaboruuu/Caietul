import { Link, useParams } from "react-router-dom";
import styles from "../styles/MatchDetailPage.module.css";
import { matchStore, formatDuration } from "../store/matchStore";

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const match = matchStore.getById(id || "");

  if (!match) {
    return (
      <div className={styles.page}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>C</div>
            <span className={styles.logoText}>Caietul</span>
          </Link>
        </nav>
        <main className={styles.main}>
          <p>Match not found</p>
          <Link to="/matches">Back to matches</Link>
        </main>
      </div>
    );
  }
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>C</div>
          <span className={styles.logoText}>Caietul</span>
        </Link>
        <div className={styles.navActions}>
          <Link to="/matches" className={`${styles.btn} ${styles.btnGhost}`}>
            ← Back
          </Link>
          <Link
            to={`/matches/${id}/edit`}
            className={`${styles.btn} ${styles.btnEdit}`}
          >
            ✏️ Edit
          </Link>
          <Link
            to={`/matches/${id}/delete`}
            className={`${styles.btn} ${styles.btnDelete}`}
          >
            🗑 Delete
          </Link>
        </div>
      </nav>

      <main className={styles.main}>
        <Link to="/matches" className={styles.back}>
          ← Back to matches
        </Link>

        <div
          className={`${styles.matchHeader} ${match.result === "Victory" ? styles.headerWin : styles.headerLoss}`}
        >
          <div className={styles.headerLeft}>
            <div
              className={`${styles.resultText} ${match.result === "Victory" ? styles.winText : styles.lossText}`}
            >
              {match.result}
            </div>
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                Champion:{" "}
                <span>
                  {match.champion} · {match.role}
                </span>
              </div>
              <div className={styles.metaItem}>
                Mode: <span>Ranked Solo/Duo</span>
              </div>
              <div className={styles.metaItem}>
                Map: <span>Summoner&apos;s Rift</span>
              </div>
              <div className={styles.metaItem}>
                Duration: <span>{formatDuration(match.duration)}</span>
              </div>
              <div className={styles.metaItem}>
                Date:{" "}
                <span>
                  {new Date(match.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className={styles.metaItem}>
                Patch: <span>{match.patch}</span>
              </div>
            </div>
          </div>
          <div className={styles.scoreCircle}>
            <div className={styles.scoreNum}>{match.visionScore}</div>
            <div className={styles.scoreLabel}>Vision</div>
          </div>
        </div>

        <div className={styles.grid2}>
          <div className={styles.card}>
            <h3>Your Performance</h3>

            <div className={styles.statRow}>
              <div className={styles.statName}>KDA</div>
              <div className={styles.statBarWrap}>
                <div
                  className={`${styles.statBar} ${styles.barGreen}`}
                  style={{ width: "85%" }}
                />
              </div>
              <div className={styles.statVal}>
                {match.kills}/{match.deaths}/{match.assists}
              </div>
            </div>

            <div className={styles.statRow}>
              <div className={styles.statName}>CS</div>
              <div className={styles.statBarWrap}>
                <div
                  className={`${styles.statBar} ${styles.barYellow}`}
                  style={{ width: "65%" }}
                />
              </div>
              <div className={styles.statVal}>
                {match.cs}{" "}
                <span className={`${styles.statDelta} ${styles.down}`}>
                  -15%
                </span>
              </div>
            </div>

            <div className={styles.statRow}>
              <div className={styles.statName}>Damage</div>
              <div className={styles.statBarWrap}>
                <div
                  className={`${styles.statBar} ${styles.barGreen}`}
                  style={{ width: "90%" }}
                />
              </div>
              <div className={styles.statVal}>
                28.4k{" "}
                <span className={`${styles.statDelta} ${styles.up}`}>+28%</span>
              </div>
            </div>

            <div className={styles.statRow}>
              <div className={styles.statName}>Vision Score</div>
              <div className={styles.statBarWrap}>
                <div
                  className={`${styles.statBar} ${styles.barBlue}`}
                  style={{ width: "78%" }}
                />
              </div>
              <div className={styles.statVal}>{match.visionScore}</div>
            </div>

            <div className={styles.highlightRow}>
              <div className={`${styles.highlightCard} ${styles.hlWin}`}>
                <div className={styles.hlIcon}>🏆</div>
                <div>
                  <div className={styles.hlTitle}>Best Moment</div>
                  <div className={styles.hlDesc}>
                    Triple kill at 18:32 securing Baron
                  </div>
                </div>
              </div>
              <div className={`${styles.highlightCard} ${styles.hlWarn}`}>
                <div className={styles.hlIcon}>⚠️</div>
                <div>
                  <div className={styles.hlTitle}>Biggest Mistake</div>
                  <div className={styles.hlDesc}>
                    Caught without vision at 24:15
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3>Improvement Tips · Yasuo</h3>

            <div className={styles.tipItem}>
              <div className={`${styles.tipDot} ${styles.dotGreen}`} />
              <div className={styles.tipText}>
                Great vision control — 3.2 wards placed per minute, well above
                average.
              </div>
            </div>
            <div className={styles.tipItem}>
              <div className={`${styles.tipDot} ${styles.dotGreen}`} />
              <div className={styles.tipText}>
                High damage output — 28% above rank average for mid laners.
              </div>
            </div>
            <div className={styles.tipItem}>
              <div className={`${styles.tipDot} ${styles.dotYellow}`} />
              <div className={styles.tipText}>
                CS was 15% below average for your rank — aim for 7+ CS/min in
                lane.
              </div>
            </div>
            <div className={styles.tipItem}>
              <div className={`${styles.tipDot} ${styles.dotYellow}`} />
              <div className={styles.tipText}>
                Deaths could be reduced — try to stay below 4 deaths per game.
              </div>
            </div>
            <div className={styles.tipItem}>
              <div className={`${styles.tipDot} ${styles.dotBlue}`} />
              <div className={styles.tipText}>
                Practice wave management to create roam opportunities in the mid
                game.
              </div>
            </div>
            <div className={styles.tipItem}>
              <div className={`${styles.tipDot} ${styles.dotBlue}`} />
              <div className={styles.tipText}>
                Ward deeper when ahead to track the enemy jungler and protect
                your lead.
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Full Scoreboard</h3>

          <div className={`${styles.teamHeader} ${styles.blueHeader}`}>
            🔵 Blue Team — Victory
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Summoner</th>
                <th>Champion</th>
                <th>KDA</th>
                <th>CS</th>
                <th>Gold</th>
                <th>Damage</th>
                <th>Vision</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.me}>
                <td>
                  <strong>ShadowBlade ★</strong>
                </td>
                <td>Yasuo</td>
                <td>12/5/8</td>
                <td>185</td>
                <td>14.3k</td>
                <td>28.4k</td>
                <td>32</td>
              </tr>
              <tr>
                <td>JungleKing42</td>
                <td>Lee Sin</td>
                <td>5/6/14</td>
                <td>128</td>
                <td>10.8k</td>
                <td>15.2k</td>
                <td>45</td>
              </tr>
              <tr>
                <td>TopLaneGod</td>
                <td>Darius</td>
                <td>8/4/7</td>
                <td>201</td>
                <td>13.6k</td>
                <td>22.1k</td>
                <td>28</td>
              </tr>
              <tr>
                <td>SupportMaster</td>
                <td>Thresh</td>
                <td>2/7/18</td>
                <td>42</td>
                <td>8.2k</td>
                <td>6.8k</td>
                <td>68</td>
              </tr>
              <tr>
                <td>ADCCarry</td>
                <td>Jinx</td>
                <td>11/5/9</td>
                <td>234</td>
                <td>16.9k</td>
                <td>32.5k</td>
                <td>31</td>
              </tr>
            </tbody>
          </table>

          <div className={`${styles.teamHeader} ${styles.redHeader}`}>
            🔴 Red Team — Defeat
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Summoner</th>
                <th>Champion</th>
                <th>KDA</th>
                <th>CS</th>
                <th>Gold</th>
                <th>Damage</th>
                <th>Vision</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>MidOrFeed</td>
                <td>Syndra</td>
                <td>6/9/8</td>
                <td>172</td>
                <td>11.2k</td>
                <td>21.4k</td>
                <td>22</td>
              </tr>
              <tr>
                <td>NightStalker</td>
                <td>Kha&apos;Zix</td>
                <td>10/8/6</td>
                <td>145</td>
                <td>12.8k</td>
                <td>26.3k</td>
                <td>19</td>
              </tr>
              <tr>
                <td>TankBuster</td>
                <td>Ornn</td>
                <td>3/10/11</td>
                <td>189</td>
                <td>10.9k</td>
                <td>18.7k</td>
                <td>35</td>
              </tr>
              <tr>
                <td>HealBot9000</td>
                <td>Lulu</td>
                <td>1/6/15</td>
                <td>38</td>
                <td>7.6k</td>
                <td>5.2k</td>
                <td>52</td>
              </tr>
              <tr>
                <td>BotLaneHero</td>
                <td>Ezreal</td>
                <td>7/5/8</td>
                <td>215</td>
                <td>14.7k</td>
                <td>29.8k</td>
                <td>26</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

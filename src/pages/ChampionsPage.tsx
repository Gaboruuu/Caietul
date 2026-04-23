import { useEffect, useMemo, useState } from "react";
import {
  createChampion,
  deleteChampion,
  fetchChampions,
  updateChampion,
} from "../api/championsApi";
import styles from "../styles/ChampionsPage.module.css";
import type { Champion, ChampionInput } from "../types/champion";
import { ROLES } from "../types/match";

const emptyForm: ChampionInput = {
  name: "",
  icon: "",
  role: "Mid",
};

export default function ChampionsPage() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [form, setForm] = useState<ChampionInput>(emptyForm);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChampions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchChampions();
      setChampions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load champions.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadChampions();
  }, []);

  const sortedChampions = useMemo(
    () =>
      [...champions].sort((left, right) => {
        return (
          right.matchesCount - left.matchesCount ||
          left.name.localeCompare(right.name)
        );
      }),
    [champions],
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingName(null);
  };

  const handleEdit = (champion: Champion) => {
    setEditingName(champion.name);
    setForm({
      name: champion.name,
      icon: champion.icon,
      role: champion.role,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      if (editingName) {
        await updateChampion(editingName, form);
      } else {
        await createChampion(form);
      }

      resetForm();
      await loadChampions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save champion.");
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Delete ${name}?`)) {
      return;
    }

    setError(null);

    try {
      await deleteChampion(name);
      if (editingName === name) {
        resetForm();
      }
      await loadChampions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete champion.",
      );
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.kicker}>Roster management</p>
            <h1>Champions</h1>
            <p className={styles.subtitle}>
              Maintain the parent records that own your match history. Each
              champion can have many matches attached to it, and the page keeps
              their aggregate stats up to date.
            </p>
          </div>
          <div className={styles.heroStats}>
            <div>
              <strong>{sortedChampions.length}</strong>
              <span>Tracked champions</span>
            </div>
            <div>
              <strong>
                {sortedChampions.reduce(
                  (sum, champion) => sum + champion.matchesCount,
                  0,
                )}
              </strong>
              <span>Linked matches</span>
            </div>
          </div>
        </section>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <section className={styles.layout}>
          <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles.cardHeader}>
              <h2>{editingName ? "Edit champion" : "Add champion"}</h2>
              {editingName && (
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={resetForm}
                >
                  Cancel edit
                </button>
              )}
            </div>

            <label className={styles.field}>
              <span>Name</span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="e.g. Syndra"
                disabled={!!editingName}
              />
            </label>

            <label className={styles.field}>
              <span>Icon</span>
              <input
                value={form.icon}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, icon: event.target.value }))
                }
                placeholder="e.g. 🔮"
              />
            </label>

            <label className={styles.field}>
              <span>Role</span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    role: event.target.value as ChampionInput["role"],
                  }))
                }
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className={styles.primaryBtn}>
              {editingName ? "Save Champion" : "Add Champion"}
            </button>
          </form>

          <div className={styles.listColumn}>
            {isLoading ? (
              <div className={styles.card}>Loading champions...</div>
            ) : (
              sortedChampions.map((champion) => (
                <article className={styles.card} key={champion.name}>
                  <div className={styles.championTop}>
                    <div className={styles.championIcon}>{champion.icon}</div>
                    <div>
                      <h3>{champion.name}</h3>
                      <p>
                        {champion.role} · {champion.matchesCount} matches
                      </p>
                    </div>
                    <div className={styles.winRate}>
                      {champion.winRate.toFixed(1)}%
                    </div>
                  </div>

                  <div className={styles.statGrid}>
                    <div>
                      <span>Wins</span>
                      <strong>{champion.wins}</strong>
                    </div>
                    <div>
                      <span>Losses</span>
                      <strong>{champion.losses}</strong>
                    </div>
                    <div>
                      <span>Win rate</span>
                      <strong>{champion.winRate.toFixed(1)}%</strong>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button type="button" onClick={() => handleEdit(champion)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(champion.name)}
                      disabled={champion.matchesCount > 0}
                      title={
                        champion.matchesCount > 0
                          ? "Delete or reassign the linked matches first"
                          : "Delete champion"
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

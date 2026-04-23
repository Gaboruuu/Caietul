import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import styles from "../styles/MatchFormPage.module.css";
import {
  validateMatch,
  isValid,
  type ValidationErrors,
} from "../store/matchStore";
import {
  ApiValidationError,
  createMatch,
  fetchMatchById,
  updateMatch,
} from "../api/matchesApi";
import { fetchChampions } from "../api/championsApi";
import {
  ROLES,
  RESULTS,
  type Match,
  type Role,
  type Result,
} from "../types/match";
import type { Champion } from "../types/champion";
import championCatalog from "../data/champions.json";

type MatchFormValues = {
  champion: string;
  role: Role;
  result: Result;
  kills: string;
  deaths: string;
  assists: string;
  cs: string;
  visionScore: string;
  durationMins: string;
  durationSecs: string;
  dateInput: string;
  patch: string;
  notes: string;
};

type NumberFieldConfig = {
  key: "kills" | "deaths" | "assists" | "cs" | "visionScore";
  label: string;
  min: number;
  max: number;
};

const toDateTimeInput = (isoDate?: string): string => {
  if (!isoDate) {
    return "";
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
};

const fromDateTimeInput = (value: string): string => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const getInitialFormValues = (match: Match | null): MatchFormValues => ({
  champion: match?.champion ?? "",
  role: match?.role ?? "Mid",
  result: match?.result ?? "Victory",
  kills: match ? String(match.kills) : "",
  deaths: match ? String(match.deaths) : "",
  assists: match ? String(match.assists) : "",
  cs: match ? String(match.cs) : "",
  visionScore: match ? String(match.visionScore) : "",
  durationMins: match ? String(Math.floor(match.duration / 60)) : "",
  durationSecs: match ? String(match.duration % 60) : "",
  dateInput: toDateTimeInput(match?.date),
  patch: match?.patch ?? "",
  notes: match?.notes ?? "",
});

const numberFieldConfig: NumberFieldConfig[] = [
  { key: "kills", label: "Kills", min: 0, max: 99 },
  { key: "deaths", label: "Deaths", min: 0, max: 99 },
  { key: "assists", label: "Assists", min: 0, max: 99 },
  { key: "cs", label: "CS", min: 0, max: 1500 },
  { key: "visionScore", label: "Vision Score", min: 0, max: 300 },
];

const fallbackChampions: Champion[] = championCatalog.map((champion) => ({
  ...champion,
  role: champion.role as Role,
  matchesCount: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
}));

export default function MatchFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [existingMatch, setExistingMatch] = useState<Match | null>(null);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isLoadingChampions, setIsLoadingChampions] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadMatch = async () => {
      if (!isEditing || !id) {
        if (active) {
          setExistingMatch(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setSubmitError(null);

      try {
        const loadedMatch = await fetchMatchById(id);
        if (active) {
          setExistingMatch(loadedMatch);
        }
      } catch {
        if (active) {
          setExistingMatch(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadMatch();

    return () => {
      active = false;
    };
  }, [id, isEditing]);

  useEffect(() => {
    let active = true;

    const loadChampions = async () => {
      setIsLoadingChampions(true);

      try {
        const loadedChampions = await fetchChampions();
        if (active) {
          setChampions(
            loadedChampions.length > 0 ? loadedChampions : fallbackChampions,
          );
        }
      } catch {
        if (active) {
          setChampions(fallbackChampions);
        }
      } finally {
        if (active) {
          setIsLoadingChampions(false);
        }
      }
    };

    void loadChampions();

    return () => {
      active = false;
    };
  }, []);

  const initialValues = useMemo(
    () => getInitialFormValues(existingMatch),
    [existingMatch],
  );
  const [form, setForm] = useState<MatchFormValues>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (form.champion || champions.length === 0) {
      return;
    }

    setForm((prev) => ({ ...prev, champion: champions[0]?.name ?? "" }));
  }, [champions, form.champion]);

  const setField = <K extends keyof MatchFormValues>(
    key: K,
    value: MatchFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const inputClass = (hasError: boolean) =>
    `${styles.input} ${hasError ? styles.inputError : ""}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalSeconds =
      (parseInt(form.durationMins, 10) || 0) * 60 +
      (parseInt(form.durationSecs, 10) || 0);

    const matchData: Omit<Match, "id"> = {
      champion: form.champion.trim(),
      role: form.role,
      result: form.result,
      kills: parseInt(form.kills, 10) || 0,
      deaths: parseInt(form.deaths, 10) || 0,
      assists: parseInt(form.assists, 10) || 0,
      cs: parseInt(form.cs, 10) || 0,
      visionScore: parseInt(form.visionScore, 10) || 0,
      duration: totalSeconds,
      date: fromDateTimeInput(form.dateInput) || new Date().toISOString(),
      patch: form.patch.trim(),
      notes: form.notes.trim() || undefined,
    };

    const validationErrors = validateMatch(matchData);
    if (!isValid(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);

    try {
      if (isEditing && existingMatch) {
        await updateMatch(existingMatch.id, matchData);
      } else {
        await createMatch(matchData);
      }

      navigate("/matches");
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setErrors((prev) => ({
          ...prev,
          ...(err.details as ValidationErrors),
        }));
        return;
      }

      setSubmitError(
        err instanceof Error ? err.message : "Failed to save match.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p>Loading match...</p>
        </main>
      </div>
    );
  }

  if (isEditing && !existingMatch) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p>Match not found</p>
          <Link to="/matches" className={styles.back}>
            Back to matches
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Link to="/matches" className={styles.back}>
          ← Back to matches
        </Link>
        <Link
          to="/champions"
          className={styles.back}
          style={{ marginLeft: 12 }}
        >
          Manage champions
        </Link>

        <h1 className={styles.title}>{isEditing ? "Edit" : "Add"} Match</h1>
        <p className={styles.subtitle}>
          {isEditing
            ? "Update the details for this match entry."
            : "Record a new match and track your performance."}
        </p>

        {submitError && <p className={styles.errorText}>{submitError}</p>}

        <form onSubmit={handleSubmit}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Match Info</div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="champion">
                  Champion
                </label>
                <select
                  id="champion"
                  className={inputClass(!!errors.champion)}
                  value={form.champion}
                  onChange={(e) => setField("champion", e.target.value)}
                  disabled={isLoadingChampions || champions.length === 0}
                >
                  {champions.map((champion) => (
                    <option key={champion.name} value={champion.name}>
                      {champion.icon} {champion.name} · {champion.role}
                    </option>
                  ))}
                </select>
                {champions.length === 0 && !isLoadingChampions && (
                  <div className={styles.errorText}>
                    No champions exist yet. Create one in the Champions section
                    first.
                  </div>
                )}
                {errors.champion && (
                  <div className={styles.errorText}>{errors.champion}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  className={styles.select}
                  value={form.role}
                  onChange={(e) => setField("role", e.target.value as Role)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="result">
                  Result
                </label>
                <select
                  id="result"
                  className={styles.select}
                  value={form.result}
                  onChange={(e) => setField("result", e.target.value as Result)}
                >
                  {RESULTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  className={inputClass(!!errors.date)}
                  type="datetime-local"
                  value={form.dateInput}
                  onChange={(e) => setField("dateInput", e.target.value)}
                />
                {errors.date && (
                  <div className={styles.errorText}>{errors.date}</div>
                )}
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="patch">
                  Patch
                </label>
                <input
                  id="patch"
                  className={inputClass(!!errors.patch)}
                  type="text"
                  value={form.patch}
                  onChange={(e) => setField("patch", e.target.value)}
                  placeholder="e.g. 14.8"
                />
                {errors.patch && (
                  <div className={styles.errorText}>{errors.patch}</div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Your Stats</div>

            <div className={styles.grid3}>
              {numberFieldConfig.slice(0, 3).map((field) => (
                <div className={styles.field} key={field.key}>
                  <label className={styles.label} htmlFor={field.key}>
                    {field.label}
                  </label>
                  <input
                    id={field.key}
                    className={inputClass(!!errors[field.key])}
                    type="number"
                    value={form[field.key]}
                    onChange={(e) => setField(field.key, e.target.value)}
                    min={field.min}
                    max={field.max}
                  />
                  {errors[field.key] && (
                    <div className={styles.errorText}>{errors[field.key]}</div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.grid3}>
              {numberFieldConfig.slice(3).map((field) => (
                <div className={styles.field} key={field.key}>
                  <label className={styles.label} htmlFor={field.key}>
                    {field.label}
                  </label>
                  <input
                    id={field.key}
                    className={inputClass(!!errors[field.key])}
                    type="number"
                    value={form[field.key]}
                    onChange={(e) => setField(field.key, e.target.value)}
                    min={field.min}
                    max={field.max}
                  />
                  {errors[field.key] && (
                    <div className={styles.errorText}>{errors[field.key]}</div>
                  )}
                </div>
              ))}

              <div className={styles.field}>
                <label className={styles.label}>Duration (mm:ss)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    className={inputClass(!!errors.duration)}
                    type="number"
                    value={form.durationMins}
                    onChange={(e) => setField("durationMins", e.target.value)}
                    placeholder="mm"
                    min={0}
                    max={120}
                    style={{ flex: 1 }}
                  />
                  <span style={{ alignSelf: "center" }}>:</span>
                  <input
                    className={inputClass(!!errors.duration)}
                    type="number"
                    value={form.durationSecs}
                    onChange={(e) => setField("durationSecs", e.target.value)}
                    placeholder="ss"
                    min={0}
                    max={59}
                    style={{ flex: 1 }}
                  />
                </div>
                {errors.duration && (
                  <div className={styles.errorText}>{errors.duration}</div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Personal Notes</div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="notes">
                Notes (optional)
              </label>
              <input
                id="notes"
                className={styles.input}
                type="text"
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="e.g. Good early game, bad teamfights..."
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Link to="/matches" className={`${styles.btn} ${styles.btnCancel}`}>
              Cancel
            </Link>
            <button type="submit" className={`${styles.btn} ${styles.btnSave}`}>
              {isEditing ? "Save Changes" : "Add Match"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

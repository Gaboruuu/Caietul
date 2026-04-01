import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import styles from "../styles/MatchFormPage.module.css";
import {
  matchStore,
  validateMatch,
  isValid,
  type ValidationErrors,
} from "../store/matchStore";
import {
  ROLES,
  RESULTS,
  type Match,
  type Role,
  type Result,
} from "../types/match";

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

export default function MatchFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const match = isEditing ? (matchStore.getById(id!) ?? null) : null;

  const initialValues = useMemo(() => getInitialFormValues(match), [match]);
  const [form, setForm] = useState<MatchFormValues>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const setField = <K extends keyof MatchFormValues>(
    key: K,
    value: MatchFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const inputClass = (hasError: boolean) =>
    `${styles.input} ${hasError ? styles.inputError : ""}`;

  const handleSubmit = (e: React.FormEvent) => {
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
    if (isEditing && match) {
      matchStore.update(match.id, matchData);
    } else {
      matchStore.add(matchData);
    }

    navigate("/matches");
  };

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>C</div>
          <span className={styles.logoText}>Caietul</span>
        </Link>
      </nav>

      <main className={styles.main}>
        <Link to="/matches" className={styles.back}>
          ← Back to matches
        </Link>

        <h1 className={styles.title}>{isEditing ? "Edit" : "Add"} Match</h1>
        <p className={styles.subtitle}>
          {isEditing
            ? "Update the details for this match entry."
            : "Record a new match and track your performance."}
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Match Info</div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="champion">
                  Champion
                </label>
                <input
                  id="champion"
                  className={inputClass(!!errors.champion)}
                  type="text"
                  value={form.champion}
                  onChange={(e) => setField("champion", e.target.value)}
                  placeholder="e.g. Syndra"
                />
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

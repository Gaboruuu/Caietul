import { randomUUID } from "node:crypto";
import { loadSeedMatches } from "../data/seedMatches.js";

const cloneMatch = (match) => ({ ...match });

const cloneMatches = (matches) => matches.map(cloneMatch);

const sortMatchesByDateDesc = (matches) =>
  [...matches].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime() ||
      right.id.localeCompare(left.id),
  );

export const createMatchStore = (initialMatches = loadSeedMatches()) => {
  let matches = cloneMatches(initialMatches);

  const setMatches = (nextMatches) => {
    matches = cloneMatches(nextMatches);
  };

  return {
    list() {
      return cloneMatches(sortMatchesByDateDesc(matches));
    },

    getById(id) {
      const match = matches.find((entry) => entry.id === id);
      return match ? cloneMatch(match) : undefined;
    },

    create(data) {
      const created = { ...cloneMatch(data), id: `match-${randomUUID()}` };
      matches = [created, ...matches];
      return cloneMatch(created);
    },

    update(id, data) {
      const existingIndex = matches.findIndex((entry) => entry.id === id);
      if (existingIndex === -1) {
        return null;
      }

      const updated = { ...cloneMatch(data), id };
      matches = matches.map((entry) => (entry.id === id ? updated : entry));
      return cloneMatch(updated);
    },

    delete(id) {
      const before = matches.length;
      matches = matches.filter((entry) => entry.id !== id);
      return matches.length !== before;
    },

    paginate(page, pageSize) {
      const sorted = sortMatchesByDateDesc(matches);
      const total = sorted.length;
      const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
      const start = (page - 1) * pageSize;

      return {
        items: cloneMatches(sorted.slice(start, start + pageSize)),
        total,
        totalPages,
      };
    },

    reset(nextMatches = loadSeedMatches()) {
      setMatches(nextMatches);
    },
  };
};

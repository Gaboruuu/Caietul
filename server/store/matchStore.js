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

export const createMatchStore = (
  modelsOrNull,
  initialMatches = loadSeedMatches(),
) => {
  // If models are not provided, fall back to the in-memory synchronous store (used by tests)
  if (!modelsOrNull || !modelsOrNull.Match) {
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
  }

  // ORM-backed async store
  const { Match, Champion } = modelsOrNull;

  return {
    async list() {
      const rows = await Match.findAll({
        order: [
          ["date", "DESC"],
          ["id", "ASC"],
        ],
      });
      return rows.map((r) => r.get({ plain: true }));
    },

    async getById(id) {
      const row = await Match.findByPk(id);
      return row ? row.get({ plain: true }) : undefined;
    },

    async create(data) {
      // Ensure champion exists and find its id
      const champion = await Champion.findOne({
        where: { name: data.champion },
      });
      if (!champion) throw new Error("Champion must exist");

      const id = `match-${randomUUID()}`;
      const created = await Match.create({
        ...data,
        id,
        championId: champion.id,
        date: new Date(data.date),
      });
      return created.get({ plain: true });
    },

    async update(id, data) {
      const row = await Match.findByPk(id);
      if (!row) return null;

      const champion = await Champion.findOne({
        where: { name: data.champion },
      });
      if (!champion) throw new Error("Champion must exist");

      await row.update({
        ...data,
        championId: champion.id,
        date: new Date(data.date),
      });
      return row.get({ plain: true });
    },

    async delete(id) {
      const rows = await Match.destroy({ where: { id } });
      return rows > 0;
    },

    async paginate(page, pageSize) {
      const offset = (page - 1) * pageSize;
      const { count, rows } = await Match.findAndCountAll({
        limit: pageSize,
        offset,
        order: [
          ["date", "DESC"],
          ["id", "ASC"],
        ],
      });
      return {
        items: rows.map((r) => r.get({ plain: true })),
        total: count,
        totalPages: count === 0 ? 0 : Math.ceil(count / pageSize),
      };
    },

    async reset() {
      // Danger in production: only for development/test use
      await Match.destroy({ where: {} });
    },
  };
};

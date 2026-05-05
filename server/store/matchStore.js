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

const hydrateMatch = (row) => {
  const plain = row.get ? row.get({ plain: true }) : cloneMatch(row);
  const championName =
    plain.Champion?.name ?? plain.champion ?? plain.championId;

  const { Champion, championId, ...rest } = plain;

  return {
    ...rest,
    champion: championName,
    championId,
  };
};

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
        include: [{ model: Champion, attributes: ["name"] }],
        order: [
          ["date", "DESC"],
          ["id", "ASC"],
        ],
      });
      return rows.map(hydrateMatch);
    },

    async getById(id) {
      const row = await Match.findByPk(id, {
        include: [{ model: Champion, attributes: ["name"] }],
      });
      return row ? hydrateMatch(row) : undefined;
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

      return {
        ...hydrateMatch(created),
        champion: champion.name,
      };
    },

    async update(id, data) {
      const row = await Match.findByPk(id, {
        include: [{ model: Champion, attributes: ["name"] }],
      });
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

      return {
        ...hydrateMatch(row),
        champion: champion.name,
      };
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
        include: [{ model: Champion, attributes: ["name"] }],
        order: [
          ["date", "DESC"],
          ["id", "ASC"],
        ],
      });
      return {
        items: rows.map(hydrateMatch),
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

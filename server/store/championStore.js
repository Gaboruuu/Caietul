import { loadSeedChampions } from "../data/seedChampions.js";

const cloneChampion = (champion) => ({ ...champion });

const cloneChampions = (champions) => champions.map(cloneChampion);

const normalizeName = (name) => name.trim().toLowerCase();

export const createChampionStore = (
  modelsOrNull,
  initialChampions = loadSeedChampions(),
) => {
  // In-memory fallback for tests/development when models aren't provided
  if (!modelsOrNull || !modelsOrNull.Champion) {
    let champions = cloneChampions(initialChampions);

    const setChampions = (nextChampions) => {
      champions = cloneChampions(nextChampions);
    };

    return {
      list() {
        return cloneChampions(champions);
      },

      getByName(name) {
        const target = normalizeName(name);
        const champion = champions.find(
          (entry) => normalizeName(entry.name) === target,
        );
        return champion ? cloneChampion(champion) : undefined;
      },

      create(data) {
        const name = data.name.trim();
        const existing = champions.find(
          (entry) => normalizeName(entry.name) === normalizeName(name),
        );

        if (existing) {
          return null;
        }

        const created = {
          name,
          icon: data.icon.trim(),
          role: data.role.trim(),
        };

        champions = [created, ...champions];
        return cloneChampion(created);
      },

      update(name, data) {
        const target = normalizeName(name);
        const existingIndex = champions.findIndex(
          (entry) => normalizeName(entry.name) === target,
        );

        if (existingIndex === -1) {
          return null;
        }

        const updated = {
          ...cloneChampion(champions[existingIndex]),
          icon: data.icon.trim(),
          role: data.role.trim(),
        };

        setChampions(
          champions.map((entry, index) =>
            index === existingIndex ? updated : entry,
          ),
        );

        return cloneChampion(updated);
      },

      delete(name) {
        const target = normalizeName(name);
        const before = champions.length;
        champions = champions.filter(
          (entry) => normalizeName(entry.name) !== target,
        );
        return champions.length !== before;
      },
    };
  }

  // ORM-backed store
  const { Champion } = modelsOrNull;

  return {
    async list() {
      const rows = await Champion.findAll({ order: [["name", "ASC"]] });
      return rows.map((r) => r.get({ plain: true }));
    },

    async getByName(name) {
      const row = await Champion.findOne({ where: { name } });
      return row ? row.get({ plain: true }) : undefined;
    },

    async create(data) {
      const name = data.name.trim();
      const existing = await Champion.findOne({ where: { name } });
      if (existing) return null;

      const id = `champ-${name.replace(/\s+/g, "-").toLowerCase()}`;
      const created = await Champion.create({
        id,
        name,
        icon: data.icon.trim(),
        role: data.role.trim(),
      });
      return created.get({ plain: true });
    },

    async update(name, data) {
      const row = await Champion.findOne({ where: { name } });
      if (!row) return null;

      await row.update({ icon: data.icon.trim(), role: data.role.trim() });
      return row.get({ plain: true });
    },

    async delete(name) {
      const rows = await Champion.destroy({ where: { name } });
      return rows > 0;
    },
  };
};

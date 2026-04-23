import { loadSeedChampions } from "../data/seedChampions.js";

const cloneChampion = (champion) => ({ ...champion });

const cloneChampions = (champions) => champions.map(cloneChampion);

const normalizeName = (name) => name.trim().toLowerCase();

export const createChampionStore = (initialChampions = loadSeedChampions()) => {
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
};

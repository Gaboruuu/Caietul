import { beforeEach, describe, expect, it } from "vitest";
import { Sequelize, DataTypes } from "sequelize";
import { createMatchStore } from "./matchStore.js";
import { createChampionStore } from "./championStore.js";

const defineModels = (sequelize) => {
  const Champion = sequelize.define(
    "Champion",
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      icon: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "Champions", timestamps: false },
  );

  const Match = sequelize.define(
    "Match",
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      championId: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING, allowNull: false },
      result: { type: DataTypes.STRING, allowNull: false },
      kills: { type: DataTypes.INTEGER, allowNull: false },
      deaths: { type: DataTypes.INTEGER, allowNull: false },
      assists: { type: DataTypes.INTEGER, allowNull: false },
      cs: { type: DataTypes.INTEGER, allowNull: false },
      visionScore: { type: DataTypes.INTEGER, allowNull: false },
      duration: { type: DataTypes.INTEGER, allowNull: false },
      date: { type: DataTypes.DATE, allowNull: false },
      patch: { type: DataTypes.STRING, allowNull: false },
      notes: { type: DataTypes.TEXT },
    },
    { tableName: "Matches", timestamps: false },
  );

  Champion.hasMany(Match, { foreignKey: "championId" });
  Match.belongsTo(Champion, { foreignKey: "championId" });

  return { sequelize, Champion, Match };
};

let models;
let championStore;
let matchStore;

beforeEach(async () => {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
  models = defineModels(sequelize);
  await sequelize.sync({ force: true });
  championStore = createChampionStore(models);
  matchStore = createMatchStore(models);
});

describe("ORM-backed stores (integration)", () => {
  it("creates and queries champions and matches", async () => {
    const champ = await championStore.create({
      name: "Test Champ",
      icon: "ic",
      role: "Top",
    });
    expect(champ).toBeTruthy();

    const created = await matchStore.create({
      champion: "Test Champ",
      role: "Top",
      result: "Victory",
      kills: 5,
      deaths: 2,
      assists: 3,
      cs: 150,
      visionScore: 10,
      duration: 1200,
      date: new Date().toISOString(),
      patch: "25.6",
      notes: "ok",
    });

    expect(created).toBeTruthy();

    const fetched = await matchStore.getById(created.id);
    expect(fetched).toBeTruthy();
    expect(fetched.kills).toBe(5);

    const page = await matchStore.paginate(1, 10);
    expect(page.total).toBeGreaterThanOrEqual(1);

    const updated = await matchStore.update(created.id, {
      ...created,
      kills: 9,
      champion: "Test Champ",
    });
    expect(updated.kills).toBe(9);

    const removed = await matchStore.delete(created.id);
    expect(removed).toBe(true);
  });
});

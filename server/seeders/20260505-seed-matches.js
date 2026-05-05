"use strict";
const fs = require("fs");
const path = require("path");

module.exports = {
  async up(queryInterface) {
    const file = path.resolve(__dirname, "../../src/data/matchSeed.json");
    const raw = fs.readFileSync(file, "utf8");
    const matches = JSON.parse(raw);

    const rows = matches.map((m) => ({
      id:
        m.id || `match-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      championId: `champ-${m.champion.replace(/\s+/g, "-").toLowerCase()}`,
      role: m.role,
      result: m.result,
      kills: m.kills,
      deaths: m.deaths,
      assists: m.assists,
      cs: m.cs,
      visionScore: m.visionScore,
      duration: m.duration,
      date: m.date,
      patch: m.patch,
      notes: m.notes,
    }));

    await queryInterface.bulkInsert("Matches", rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Matches", null, {});
  },
};

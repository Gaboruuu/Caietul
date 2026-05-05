"use strict";
const fs = require("fs");
const path = require("path");

module.exports = {
  async up(queryInterface) {
    const file = path.resolve(__dirname, "../../src/data/champions.json");
    const raw = fs.readFileSync(file, "utf8");
    const champions = JSON.parse(raw);

    const rows = champions.map((c) => ({
      id: `champ-${c.name.replace(/\s+/g, "-").toLowerCase()}`,
      name: c.name,
      icon: c.icon,
      role: c.role,
    }));

    await queryInterface.bulkInsert("Champions", rows, {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Champions", null, {});
  },
};

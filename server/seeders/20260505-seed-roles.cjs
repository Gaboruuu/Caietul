"use strict";

const { randomUUID } = require("node:crypto");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Roles",
      [
        {
          id: randomUUID(),
          name: "admin",
          description: "Full system administrator",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          name: "user",
          description: "Normal application user",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.bulkDelete("Roles", null, {});
  },
};

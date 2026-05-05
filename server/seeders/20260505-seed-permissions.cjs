"use strict";

const { randomUUID } = require("node:crypto");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Permissions",
      [
        {
          id: randomUUID(),
          name: "manage_all",
          description: "Full access to all resources",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          name: "view_only",
          description: "Read-only access",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.bulkDelete("Permissions", null, {});
  },
};

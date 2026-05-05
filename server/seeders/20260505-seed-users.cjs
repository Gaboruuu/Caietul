"use strict";

const { randomUUID } = require("node:crypto");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          id: randomUUID(),
          email: "admin@example.com",
          password: "adminpass",
          name: "Administrator",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          email: "user@example.com",
          password: "userpass",
          name: "Normal User",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};

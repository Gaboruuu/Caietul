"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          id: Sequelize.literal("gen_random_uuid()"),
          email: "admin@example.com",
          password: "adminpass",
          name: "Administrator",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: Sequelize.literal("gen_random_uuid()"),
          email: "user@example.com",
          password: "userpass",
          name: "Normal User",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};

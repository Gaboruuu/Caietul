"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Roles",
      [
        {
          id: Sequelize.literal("gen_random_uuid()"),
          name: "admin",
          description: "Full system administrator",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: Sequelize.literal("gen_random_uuid()"),
          name: "user",
          description: "Normal application user",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.bulkDelete("Roles", null, {});
  },
};

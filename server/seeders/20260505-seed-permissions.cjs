"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Permissions",
      [
        {
          id: Sequelize.literal("gen_random_uuid()"),
          name: "manage_all",
          description: "Full access to all resources",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: Sequelize.literal("gen_random_uuid()"),
          name: "view_only",
          description: "Read-only access",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.bulkDelete("Permissions", null, {});
  },
};

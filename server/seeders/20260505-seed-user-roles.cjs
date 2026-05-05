"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Assign roles by querying inserted roles/users via raw SQL
    // Use INSERT ... SELECT pattern to map names to ids
    await queryInterface.sequelize.query(`
      INSERT INTO "UserRoles" ("userId","roleId","createdAt","updatedAt")
      SELECT u.id, r.id, now(), now()
      FROM "Users" u, "Roles" r
      WHERE (u.email = 'admin@example.com' AND r.name = 'admin')
      OR (u.email = 'user@example.com' AND r.name = 'user')
      ON CONFLICT ("userId", "roleId") DO NOTHING
    `);
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.sequelize.query(`DELETE FROM "UserRoles" WHERE 1=1`);
  },
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO "RolePermissions" ("roleId","permissionId","createdAt","updatedAt")
      SELECT r.id, p.id, now(), now()
      FROM "Roles" r, "Permissions" p
      WHERE (r.name = 'admin' AND p.name = 'manage_all')
      OR (r.name = 'user' AND p.name = 'view_only')
      ON CONFLICT ("roleId", "permissionId") DO NOTHING
    `);
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.sequelize.query(
      `DELETE FROM "RolePermissions" WHERE 1=1`,
    );
  },
};

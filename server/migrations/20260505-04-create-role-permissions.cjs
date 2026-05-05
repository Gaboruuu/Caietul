"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("RolePermissions", {
      roleId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      permissionId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    await queryInterface.addConstraint("RolePermissions", {
      fields: ["roleId"],
      type: "foreign key",
      name: "fk_rolepermissions_role",
      references: { table: "Roles", field: "id" },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint("RolePermissions", {
      fields: ["permissionId"],
      type: "foreign key",
      name: "fk_rolepermissions_permission",
      references: { table: "Permissions", field: "id" },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.dropTable("RolePermissions");
  },
};

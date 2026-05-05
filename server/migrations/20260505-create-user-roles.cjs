"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserRoles", {
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      roleId: {
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

    await queryInterface.addConstraint("UserRoles", {
      fields: ["userId"],
      type: "foreign key",
      name: "fk_userroles_user",
      references: { table: "Users", field: "id" },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint("UserRoles", {
      fields: ["roleId"],
      type: "foreign key",
      name: "fk_userroles_role",
      references: { table: "Roles", field: "id" },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.dropTable("UserRoles");
  },
};

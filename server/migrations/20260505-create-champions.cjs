"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Champions", {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      icon: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.STRING, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Champions");
  },
};

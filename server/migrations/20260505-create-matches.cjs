"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Matches", {
      id: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
      championId: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.STRING, allowNull: false },
      result: { type: Sequelize.STRING, allowNull: false },
      kills: { type: Sequelize.INTEGER, allowNull: false },
      deaths: { type: Sequelize.INTEGER, allowNull: false },
      assists: { type: Sequelize.INTEGER, allowNull: false },
      cs: { type: Sequelize.INTEGER, allowNull: false },
      visionScore: { type: Sequelize.INTEGER, allowNull: false },
      duration: { type: Sequelize.INTEGER, allowNull: false },
      date: { type: Sequelize.DATE, allowNull: false },
      patch: { type: Sequelize.STRING, allowNull: false },
      notes: { type: Sequelize.TEXT },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Matches");
  },
};

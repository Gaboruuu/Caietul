"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SuspiciousObservations", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      userEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userGroup: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      riskScore: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      occurrenceCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "observed",
      },
      reasonSummary: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      reasonDetails: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      firstSeenAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lastSeenAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lastLogId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
    });
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.dropTable("SuspiciousObservations");
  },
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AuditLogs", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      userEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userGroup: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      actionInformation: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      requestMethod: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      requestPath: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      statusCode: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      riskScore: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      suspicionReasons: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
      },
      entrySummary: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    });
  },

  async down(queryInterface /* , Sequelize */) {
    await queryInterface.dropTable("AuditLogs");
  },
};

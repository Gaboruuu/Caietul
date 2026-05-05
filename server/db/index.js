import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || null;

export let sequelize = null;

export const initDb = async () => {
  if (!databaseUrl) {
    return null;
  }

  sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });

  // Define models
  const Champion = sequelize.define(
    "Champion",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      icon: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "Champions", timestamps: false },
  );

  const Match = sequelize.define(
    "Match",
    {
      id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
      championId: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING, allowNull: false },
      result: { type: DataTypes.STRING, allowNull: false },
      kills: { type: DataTypes.INTEGER, allowNull: false },
      deaths: { type: DataTypes.INTEGER, allowNull: false },
      assists: { type: DataTypes.INTEGER, allowNull: false },
      cs: { type: DataTypes.INTEGER, allowNull: false },
      visionScore: { type: DataTypes.INTEGER, allowNull: false },
      duration: { type: DataTypes.INTEGER, allowNull: false },
      date: { type: DataTypes.DATE, allowNull: false },
      patch: { type: DataTypes.STRING, allowNull: false },
      notes: { type: DataTypes.TEXT },
    },
    { tableName: "Matches", timestamps: false },
  );

  Champion.hasMany(Match, { foreignKey: "championId" });
  Match.belongsTo(Champion, { foreignKey: "championId" });

  // User / Role / Permission models for auth
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING },
    },
    { tableName: "Users" },
  );

  const Role = sequelize.define(
    "Role",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.STRING },
    },
    { tableName: "Roles" },
  );

  const Permission = sequelize.define(
    "Permission",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.STRING },
    },
    { tableName: "Permissions" },
  );

  // Associations: many-to-many
  User.belongsToMany(Role, { through: "UserRoles", foreignKey: "userId" });
  Role.belongsToMany(User, { through: "UserRoles", foreignKey: "roleId" });

  Role.belongsToMany(Permission, {
    through: "RolePermissions",
    foreignKey: "roleId",
  });
  Permission.belongsToMany(Role, {
    through: "RolePermissions",
    foreignKey: "permissionId",
  });

  await sequelize.authenticate();

  return { sequelize, Champion, Match, User, Role, Permission };
};

const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  development: {
    url:
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@127.0.0.1:5432/caietul_dev",
    dialect: "postgres",
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
  },
};

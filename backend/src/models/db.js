const path = require("path");
const knex = require("knex");

const isTest = process.env.NODE_ENV === "test";
const filename = isTest
  ? ":memory:"
  : process.env.DATABASE_URL || path.join(__dirname, "../../data/carteira.sqlite");

const db = knex({
  client: "sqlite3",
  connection: { filename },
  useNullAsDefault: true,
  pool: {
    min: 1,
    max: 1,
    afterCreate: (connection, done) => {
      connection.run("PRAGMA foreign_keys = ON", done);
    },
  },
});

module.exports = { db };

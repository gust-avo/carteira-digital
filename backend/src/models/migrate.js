const { db } = require("./db");

async function migrate() {
  const hasUsers = await db.schema.hasTable("users");
  if (!hasUsers) {
    await db.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("nome").notNullable();
      table.string("email").notNullable().unique();
      table.string("cpf").notNullable().unique();
      table.string("senha_hash").notNullable();
      table.timestamps(true, true);
    });
  }

  const hasAccounts = await db.schema.hasTable("accounts");
  if (!hasAccounts) {
    await db.schema.createTable("accounts", (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
      table.string("tipo").notNullable();
      table.integer("saldo_centavos").notNullable().defaultTo(0);
      table.string("status").notNullable().defaultTo("ativa");
      table.timestamps(true, true);
    });
  }

  const hasTransactions = await db.schema.hasTable("transactions");
  if (!hasTransactions) {
    await db.schema.createTable("transactions", (table) => {
      table.increments("id").primary();
      table.integer("account_id").unsigned().notNullable().references("id").inTable("accounts").onDelete("CASCADE");
      table.integer("related_account_id").unsigned().nullable().references("id").inTable("accounts");
      table.string("tipo").notNullable();
      table.integer("valor_centavos").notNullable();
      table.integer("saldo_apos_centavos").notNullable();
      table.string("descricao").nullable();
      table.timestamps(true, true);
    });
  }
}

async function resetDatabase() {
  await db.schema.dropTableIfExists("transactions");
  await db.schema.dropTableIfExists("accounts");
  await db.schema.dropTableIfExists("users");
  await migrate();
}

module.exports = { migrate, resetDatabase };

if (require.main === module) {
  migrate()
    .then(() => db.destroy())
    .catch((error) => {
      console.error(error);
      db.destroy().finally(() => process.exit(1));
    });
}

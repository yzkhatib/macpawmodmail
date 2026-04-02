exports.up = async function(knex) {
  if (! await knex.schema.hasTable("settings")) {
    await knex.schema.createTable("settings", table => {
      table.string("key", 191).primary().notNullable();
      table.text("value").nullable();
      table.dateTime("updated_at").notNullable();
    });
  }
};

exports.down = async function(knex) {
  if (await knex.schema.hasTable("settings")) {
    await knex.schema.dropTable("settings");
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments('id')
        table.string('name')
        table.string('sound')
        table.string('rfid_code')
        table.string('password')
        table.boolean('admin').defaultTo(false)
        table.integer('modifier').defaultTo(1)
        table.boolean('is_default').defaultTo(true)
        table.unique('name')
        table.unique('rfid_code')
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('users');
};

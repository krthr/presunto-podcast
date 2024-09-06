import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'episodes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('published_at')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('published_at')
    })
  }
}

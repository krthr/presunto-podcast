import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audio_embeddings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('summary')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('summary')
    })
  }
}

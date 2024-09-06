import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audio_embeddings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.text('acast_episode_id').references('episodes.acast_episode_id')
      table.json('transcription')
      table.json('transcription_embedding')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

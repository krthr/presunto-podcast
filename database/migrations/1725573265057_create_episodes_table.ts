import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'episodes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.text('title').notNullable()
      table.text('audio_url')
      table.text('url')
      table.text('image')
      table.text('description')

      table.text('slug').unique()

      table.text('acast_episode_id').unique()
      table.text('acast_show_id')

      table.text('transcription_text')
      table.json('transcription_chunks')

      table.timestamp('published_at').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

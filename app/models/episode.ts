import type { HasOne } from '@adonisjs/lucid/types/relations'

import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'

import AudioEmbedding from '#models/audio_embedding'

export default class Episode extends BaseModel {
  @column({ isPrimary: true })
  declare acastEpisodeId: String

  @column()
  declare acastShowId: String

  @column()
  declare title: string

  @column()
  declare audioUrl: string

  @column()
  declare url: string

  @column()
  declare image: string

  @column()
  declare slug: string

  @hasOne(() => AudioEmbedding, { foreignKey: 'acastEpisodeId' })
  declare audioEmbedding: HasOne<typeof AudioEmbedding>

  @column.dateTime()
  declare publishedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

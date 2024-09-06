import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'

import Episode from '#models/episode'

export default class AudioEmbedding extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare acastEpisodeId: string

  @belongsTo(() => Episode, { localKey: 'acastEpisodeId' })
  declare episode: BelongsTo<typeof Episode>

  @column()
  declare summary?: string

  @column()
  declare transcription?: any

  @column()
  declare transcriptionEmbedding?: any

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'

import Episode from '#models/episode'
import logger from '@adonisjs/core/services/logger'

export default class AudioEmbedding extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare acastEpisodeId: string

  @belongsTo(() => Episode, { localKey: 'acastEpisodeId', foreignKey: 'acastEpisodeId' })
  declare episode: BelongsTo<typeof Episode>

  @column()
  declare summary?: string

  @column()
  declare transcription?: any

  @column({
    consume(value?: string) {
      if (!value) {
        return
      }

      try {
        const parsed = JSON.parse(value) as number[]

        if (Array.isArray(parsed)) {
          return parsed
        }
      } catch (error) {
        logger.error(error)
      }
    },
  })
  declare transcriptionEmbedding?: number[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

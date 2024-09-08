import type { TranscriptionBody } from '#services/replicate_service'

import { DateTime, Duration } from 'luxon'
import { BaseModel, column, computed } from '@adonisjs/lucid/orm'

import logger from '@adonisjs/core/services/logger'

export default class Episode extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare audioUrl?: string | null

  @column()
  declare url?: string | null

  @column()
  declare image?: string | null

  @column()
  declare description?: string | null

  //

  @column()
  declare slug: string

  //

  @column()
  declare acastEpisodeId: String

  @column()
  declare acastShowId: String

  //

  @column()
  declare transcriptionText?: string | null

  @column({
    consume(value?: string) {
      if (!value) {
        return
      }

      try {
        return JSON.parse(value) as TranscriptionBody['chunks']
      } catch (error) {
        logger.error({ error })
      }
    },
    prepare(value: TranscriptionBody['chunks'] | null) {
      if (value) {
        return JSON.stringify(value)
      }
    },
  })
  declare transcriptionChunks?: TranscriptionBody['chunks'] | null

  //

  @column.dateTime()
  declare publishedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  //

  @computed()
  get srt() {
    return this.transcriptionChunks
      ?.map(
        ({ text, timestamp }) =>
          `${srtFormatTimestamp(timestamp[0])} --> ${srtFormatTimestamp(timestamp[1])}\t${text}`
      )
      .join('\n')
  }
}

function srtFormatTimestamp(ts?: number | null): string {
  if (ts) {
    return Duration.fromObject({
      seconds: ts,
    }).toFormat('hh:mm:ss')
  }

  return '00:00:00'
}

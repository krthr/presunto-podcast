import type { CommandOptions } from '@adonisjs/core/types/ace'

import { inject } from '@adonisjs/core'
import { BaseCommand, flags } from '@adonisjs/core/ace'

import ace from '@adonisjs/core/services/ace'
import logger from '@adonisjs/core/services/logger'
import Episode from '#models/episode'

import { readdirSync } from 'node:fs'
import { rawAudiosPath } from '#services/audio_service'

export default class EpisodesProcess extends BaseCommand {
  static commandName = 'episodes:all'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.number({ default: 1 })
  declare limit: number

  @flags.number({ default: 3 })
  declare audioConcurrency: number

  @flags.number({ default: 5 })
  declare transcribeConcurrency: number

  @flags.string({ required: false })
  declare collectionName?: string

  @inject()
  async run() {
    logger.info('processing episodes')

    await ace.exec('episodes:get', ['--limit', this.limit.toString()])
    await ace.exec('episodes:download-audios', [
      '--limit',
      this.limit.toString(),
      '--concurrency',
      this.audioConcurrency.toString(),
    ])

    const audiosFiles = readdirSync(rawAudiosPath)
      .filter((r) => r.endsWith('.mp3'))
      .map((r) => r.replace('.mp3', ''))

    const episodes = await Episode.query().whereIn('acastEpisodeId', audiosFiles).limit(this.limit)

    while (episodes.length) {
      const chunks = episodes.splice(0, this.transcribeConcurrency)

      const promises = chunks.map((episode) =>
        ace.exec('episodes:transcribe', ['--acast-episode-id', episode.acastEpisodeId.toString()])
      )

      await Promise.all(promises)
    }

    const args: string[] = []
    if (this.collectionName) {
      args.push('--collection-name', this.collectionName)
    }

    await ace.exec('episodes:typesense', args)
  }
}

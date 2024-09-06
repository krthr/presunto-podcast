import type { CommandOptions } from '@adonisjs/core/types/ace'

import { inject } from '@adonisjs/core'
import { BaseCommand, flags } from '@adonisjs/core/ace'
import logger from '@adonisjs/core/services/logger'

import Episode from '#models/episode'
import AudioService from '#services/audio_service'

export default class EpisodesProcessAudios extends BaseCommand {
  static commandName = 'episodes:process-audios'
  static description = ''

  @flags.number({ default: 1 })
  declare limit: number

  @flags.number({ default: 3 })
  declare concurrency: number

  static options: CommandOptions = {
    startApp: true,
  }

  @inject()
  async run(audioService: AudioService) {
    const episodes = await Episode.query().orderBy('publishedAt', 'desc').limit(this.limit)

    logger.info(`${episodes.length} episodes found`)

    while (episodes.length) {
      const chunks = episodes.splice(0, this.concurrency)
      const promises = chunks.map(async (episode) => {
        logger.info(`processing episode ${episode.title} with id=${episode.acastEpisodeId}`)

        await audioService.downloadAudio(episode)
        await audioService.processAudio(episode)
      })

      await Promise.all(promises)
    }
  }
}

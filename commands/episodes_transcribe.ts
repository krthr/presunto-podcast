import type { CommandOptions } from '@adonisjs/core/types/ace'

import { BaseCommand, flags } from '@adonisjs/core/ace'
import logger from '@adonisjs/core/services/logger'

import Episode from '#models/episode'
import { inject } from '@adonisjs/core'

import { getRawAudioFilePath } from '#services/audio_service'

import { existsSync } from 'node:fs'

import ReplicateService from '#services/replicate_service'

export default class EpisodesTranscribe extends BaseCommand {
  static commandName = 'episodes:transcribe'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({ required: true })
  declare acastEpisodeId: string

  @flags.boolean({ default: false })
  declare forceTranscribe: boolean

  @inject()
  async run(replicateService: ReplicateService) {
    const episode = await Episode.findBy('acast_episode_id', this.acastEpisodeId)

    if (!episode) {
      logger.error('episode not found')
      process.exit(1)
    }

    logger.info(
      `processing "${episode.title}" with id=${episode.acastEpisodeId} slug=${episode.slug}`
    )

    if (episode.transcriptionText && !this.forceTranscribe) {
      logger.info(`episode already transcribed`)
    } else {
      const audioFilePath = getRawAudioFilePath(episode)

      if (!existsSync(audioFilePath)) {
        logger.warn(`no file found in ${audioFilePath}`)
        process.exit(1)
      }

      const { chunks, text } = await replicateService.transcribeAudio(audioFilePath)

      episode.transcriptionText = text
      episode.transcriptionChunks = chunks
      await episode.save()
    }
  }
}

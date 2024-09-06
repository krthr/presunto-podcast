import type { CommandOptions } from '@adonisjs/core/types/ace'

import { BaseCommand, flags } from '@adonisjs/core/ace'
import logger from '@adonisjs/core/services/logger'

import Episode from '#models/episode'
import { inject } from '@adonisjs/core'

import { getProcessedAudioFilePath } from '#services/audio_service'

import { existsSync } from 'node:fs'
import OpenAiService from '#services/open_ai_service'

export default class EpisodesTranscribe extends BaseCommand {
  static commandName = 'episodes:transcribe'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({ required: true })
  declare acastEpisodeId: string

  @inject()
  async run(openAiService: OpenAiService) {
    const episode = await Episode.findBy('acast_episode_id', this.acastEpisodeId)

    if (!episode) {
      logger.error('episode not found')
      process.exit(1)
    }

    logger.info(`processing "${episode.title}" with id=${episode.acastEpisodeId}`)

    const audioEmbedding = await episode.related('audioEmbedding').firstOrCreate({})

    if (audioEmbedding.transcription) {
      logger.info(`episode already transcribed`)
    } else {
      const processedAudioFilePath = getProcessedAudioFilePath(episode)

      if (!existsSync(processedAudioFilePath)) {
        logger.warn(`no file found in ${processedAudioFilePath}`)
        process.exit(1)
      }

      const transcription = await openAiService.transcribeAudio(processedAudioFilePath)
      audioEmbedding.transcription = transcription
      await audioEmbedding.save()
    }

    if (audioEmbedding.summary) {
      logger.info(`summary already exists`)
    } else {
      const summary = await openAiService.completion(
        [
          'Genera un resumen de la siguiente transcripción de un episodio de un podcast:',
          audioEmbedding.transcription,
          'RESUMEN:',
        ].join('\n')
      )

      if (summary) {
        audioEmbedding.summary = summary
        await audioEmbedding.save()
      }
    }

    if (audioEmbedding.transcriptionEmbedding) {
      logger.info(`transcription embedding already exists`)
    } else if (audioEmbedding.summary) {
      const embedding = await openAiService.embedding(audioEmbedding.summary)
      audioEmbedding.transcriptionEmbedding = embedding
      await audioEmbedding.save()
    }
  }
}

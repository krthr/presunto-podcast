import type { CommandOptions } from '@adonisjs/core/types/ace'

import { inject } from '@adonisjs/core'
import { BaseCommand } from '@adonisjs/core/ace'

import logger from '@adonisjs/core/services/logger'

import AudioEmbedding from '#models/audio_embedding'
import TypesenseService from '#services/typesense_service'

export default class EpisodesTypesense extends BaseCommand {
  static commandName = 'episodes:typesense'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  @inject()
  async run(typesenseService: TypesenseService) {
    logger.info('creating episodes collection')

    await typesenseService.getOrCreateCollection({
      name: 'episodes',
      fields: [
        {
          name: 'acast_episode_id',
          type: 'string',
        },
        {
          name: 'summary',
          type: 'string',
        },
        {
          name: 'transcription',
          type: 'string',
        },
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'image',
          type: 'string',
          index: false,
        },
        {
          name: 'transcription_embedding',
          type: 'float[]',
          num_dim: 1536,
        },
      ],
    })

    const audioEmbeddings = await AudioEmbedding.query()
      .preload('episode')
      .whereNotNull('summary')
      .whereNotNull('transcription')
      .whereNotNull('transcription_embedding')

    for (const audioEmbedding of audioEmbeddings) {
      logger.info(`indexing ${audioEmbedding.episode.title}`)

      await typesenseService.index('episodes', {
        id: audioEmbedding.acastEpisodeId,
        summary: audioEmbedding.summary,
        transcription: audioEmbedding.transcription,
        image: audioEmbedding.episode.image,
        transcription_embedding: audioEmbedding.transcriptionEmbedding,
        title: audioEmbedding.episode.title,
        acast_episode_id: audioEmbedding.acastEpisodeId,
      })
    }
  }
}

import type { CommandOptions } from '@adonisjs/core/types/ace'

import { inject } from '@adonisjs/core'
import { BaseCommand, flags } from '@adonisjs/core/ace'

import logger from '@adonisjs/core/services/logger'

import AudioEmbedding from '#models/audio_embedding'
import TypesenseService from '#services/typesense_service'

export default class EpisodesTypesense extends BaseCommand {
  static commandName = 'episodes:typesense'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.number({ default: 1 })
  declare limit: number

  @inject()
  async run(typesenseService: TypesenseService) {
    logger.info('creating episodes collection')

    await typesenseService.getOrCreateCollection({
      name: 'episodes',
      fields: [
        {
          name: 'acastEpisodeId',
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
          name: 'transcriptionEmbedding',
          type: 'float[]',
          num_dim: 1536,
        },
        {
          name: 'publishedAt',
          type: 'int64',
          sort: true,
        },
      ],
      default_sorting_field: 'publishedAt',
    })

    const audioEmbeddings = await AudioEmbedding.query()
      .preload('episode')
      .whereNotNull('summary')
      .whereNotNull('transcription')
      .whereNotNull('transcription_embedding')
      .whereHas('episode', (q) => {
        q.whereNotNull('title').whereNotNull('image').whereNotNull('published_at')
      })
      .limit(this.limit)

    for (const audioEmbedding of audioEmbeddings) {
      logger.info(`indexing ${audioEmbedding.episode.title}`)

      const { acastEpisodeId, summary, transcription, episode, transcriptionEmbedding } =
        audioEmbedding

      const { title, image } = episode

      await typesenseService.index('episodes', {
        id: acastEpisodeId,
        summary,
        transcription,
        image,
        transcriptionEmbedding,
        title,
        acastEpisodeId,
        publishedAt: episode.publishedAt.toUnixInteger(),
      })
    }
  }
}

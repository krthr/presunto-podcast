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
      name: 'episodes_2024_09_08_20_59',
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
        {
          name: 'slug',
          type: 'string',
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

    for (const audioEmbedding of audioEmbeddings) {
      logger.info(`indexing ${audioEmbedding.episode.title}`)

      const { acastEpisodeId, summary, transcription, episode, transcriptionEmbedding } =
        audioEmbedding

      const { title, image, slug } = episode

      await typesenseService.index('episodes_2024_09_08_20_59', {
        id: acastEpisodeId,
        summary,
        transcription,
        image,
        transcriptionEmbedding,
        title,
        acastEpisodeId,
        publishedAt: episode.publishedAt.toUnixInteger(),
        slug,
      })
    }
  }
}

import type { CommandOptions } from '@adonisjs/core/types/ace'

import { inject } from '@adonisjs/core'
import { BaseCommand, flags } from '@adonisjs/core/ace'

import logger from '@adonisjs/core/services/logger'

import TypesenseService from '#services/typesense_service'
import Episode from '#models/episode'

export default class EpisodesTypesense extends BaseCommand {
  static commandName = 'episodes:typesense'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string()
  declare collectionName: string

  @inject()
  async run(typesenseService: TypesenseService) {
    logger.info('creating episodes collection')

    await typesenseService.getOrCreateCollection({
      name: this.collectionName,
      enable_nested_fields: true,
      fields: [
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'audioUrl',
          type: 'string',
          index: false,
        },
        {
          name: 'url',
          type: 'string',
          index: false,
        },
        {
          name: 'image',
          type: 'string',
          index: false,
        },
        {
          name: 'description',
          type: 'string',
        },
        {
          name: 'slug',
          type: 'string',
        },
        {
          name: 'acastEpisodeId',
          type: 'string',
        },
        {
          name: 'acastShowId',
          type: 'string',
        },
        {
          name: 'transcriptionText',
          type: 'string',
        },
        {
          name: 'publishedAt',
          type: 'int64',
          sort: true,
        },
        {
          name: 'images',
          type: 'object',
          index: false,
        },
      ],
      default_sorting_field: 'publishedAt',
    })

    const episodes = await Episode.query().whereNotNull('transcription_text')

    for (const episode of episodes) {
      logger.info(`indexing ${episode.title}`)

      const {
        title,
        acastShowId,
        acastEpisodeId,
        audioUrl,
        url,
        image,
        description,
        slug,
        transcriptionText,
        images,
      } = episode

      await typesenseService.index(this.collectionName, {
        id: acastEpisodeId,
        title,
        acastEpisodeId,
        audioUrl,
        url,
        image,
        description,
        slug,
        transcriptionText,
        publishedAt: episode.publishedAt.toUnixInteger(),
        acastShowId,
        images,
      })
    }
  }
}

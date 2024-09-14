import type { CommandOptions } from '@adonisjs/core/types/ace'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

import { BaseCommand, flags } from '@adonisjs/core/ace'
import AcastService from '#services/acast_service'

import Episode from '#models/episode'

export default class EpisodesGet extends BaseCommand {
  static commandName = 'episodes:get'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.number({ default: 1 })
  declare limit: number

  @inject()
  async run(acastService: AcastService) {
    const items = await acastService.getEpisodes()

    if (!items) {
      return
    }

    for (const item of items.slice(0, this.limit)) {
      logger.info(`saving episode: ${item.title} acast_episodeId=${item.acast_episodeId}`)

      try {
        await Episode.updateOrCreate(
          {
            acastEpisodeId: item.acast_episodeId,
            acastShowId: item.acast_showId,
          },
          {
            title: item.title,
            audioUrl: item.enclosure.url,
            image: item.itunes_image.href,
            url: item.link,
            publishedAt: item.pubDate,
            slug: item.acast_episodeUrl || item.acast_episodeId,
            description: item.description,
          }
        )
      } catch (error) {
        logger.error(error, `${item.title} acast_episodeId=${item.acast_episodeId}`)
      }
    }
  }
}

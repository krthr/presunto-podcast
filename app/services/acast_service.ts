import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import vine from '@vinejs/vine'

import { XMLParser } from 'fast-xml-parser'

const itemsValidator = vine.array(
  vine.object({
    acast_episodeId: vine.string(),
    acast_showId: vine.string(),
    title: vine.unionOfTypes([vine.string(), vine.number()]),
    // description: vine.string(),
    enclosure: vine.object({
      url: vine.string().url(),
      length: vine.number().positive(),
      type: vine.enum(['audio/mpeg']),
    }),
    link: vine.string().url(),
    itunes_image: vine.object({
      href: vine.string().url(),
    }),
  })
)

@inject()
export default class AcastService {
  static BASE_URL = 'https://feeds.acast.com/public/shows/presuntopodcast'

  async getEpisodes() {
    try {
      logger.info('getting episodes')

      const response = await fetch(AcastService.BASE_URL, {})
      const body = await response.text()

      const parser = new XMLParser({
        ignoreAttributes: false,
        parseAttributeValue: true,
        transformAttributeName(name: string) {
          return name.replace(/@_/, '').replace(':', '_')
        },
        transformTagName(name: string) {
          return name.replace(/@_/, '').replace(':', '_')
        },
      })

      const parsed = parser.parse(body)
      const parsedItems = parsed.rss.channel.item

      const items = await vine.validate({ schema: itemsValidator, data: parsedItems })
      logger.info(`found ${items.length} episodes`)

      return items
    } catch (error) {
      logger.error(error)
    }
  }
}

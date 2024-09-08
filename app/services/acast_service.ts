import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import vine from '@vinejs/vine'

import { XMLParser } from 'fast-xml-parser'
import { DateTime } from 'luxon'

const itemsValidator = vine.array(
  vine.object({
    acast_episodeId: vine.string(),
    acast_showId: vine.string(),
    acast_episodeUrl: vine
      .any()
      .transform((v) => {
        if (typeof v === 'string' || typeof v === 'number') {
          return v.toString()
        }
      })
      .optional(),
    title: vine.any().transform((v: unknown) => {
      if (typeof v === 'string') {
        return v
      }
    }),
    pubDate: vine.string().transform((value) => DateTime.fromJSDate(new Date(value))),
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

import type { CommandOptions } from '@adonisjs/core/types/ace'
import { BaseCommand } from '@adonisjs/core/ace'

import { SitemapStream } from 'sitemap'

import Episode from '#models/episode'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'

const BASE_URL = 'https://presunto.krthr.co'

export default class GenerateSitemap extends BaseCommand {
  static commandName = 'generate:sitemap'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('querying episodes...')

    const episodes = await Episode.query().select('id', 'acastEpisodeId', 'slug')
    const links: { url: string }[] = []

    for (const episode of episodes) {
      links.push({ url: `/${episode.acastEpisodeId}` })
      links.push({ url: `/${episode.slug}` })
    }

    this.logger.info(`found ${episodes.length} episodes`)
    this.logger.info(`writing file...`)

    const sitemapStream = new SitemapStream({ hostname: BASE_URL })
    Readable.from(links)
      .pipe(sitemapStream)
      .pipe(createWriteStream('public/sitemap.xml', { flags: 'w' }))
  }
}

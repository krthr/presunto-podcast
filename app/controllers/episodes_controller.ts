import type { HttpContext } from '@adonisjs/core/http'
import type { MultiSearchRequestSchema } from 'typesense/lib/Typesense/MultiSearch.js'

import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

import Episode from '#models/episode'

import TypesenseService from '#services/typesense_service'

// import Episode from '#models/episode'

@inject()
export default class EpisodesController {
  constructor(protected typesenseService: TypesenseService) {}

  async search({ request, session, view }: HttpContext) {
    let q: string = (request.input('q', '') || '').trim()

    if (!q) {
      q = '*'
    }

    try {
      const payload: MultiSearchRequestSchema = {
        collection: 'episodes',
        q,
      }

      const sort_by: string[] = []

      sort_by.push('_text_match:desc')
      sort_by.push('publishedAt:desc')
      payload.sort_by = sort_by.join(',')

      const { results } = await this.typesenseService.client.multiSearch.perform<
        {
          acastEpisodeId: string
          summary: string
          transcription: string
          title: string
          image: string
          publishedAt: number
        }[]
      >(
        {
          searches: [payload],
        },
        {
          query_by: 'transcription,title',
          exclude_fields: 'transcriptionEmbedding',
          per_page: 250,
          highlight_affix_num_tokens: 10,
        }
      )

      if (q !== '*') {
        session.put('q', q)
      } else {
        session.forget('q')
      }

      const episodes = results.at(0)
      episodes?.hits?.at(0)?.highlights?.at(0)?.snippet
      return view.render('pages/home', { episodes })
    } catch (error) {
      logger.error({ error })
      return view.render('pages/home', {})
    }
  }

  async show({ request, response, view }: HttpContext) {
    const id = request.param('id')
    const episode = await Episode.query()
      .where('acastEpisodeId', id)
      .preload('audioEmbedding')
      .first()

    if (episode) {
      return view.render('pages/episode', { episode })
    }

    return response.redirect('/')
  }
}

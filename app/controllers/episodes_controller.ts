import type { HttpContext } from '@adonisjs/core/http'
import type { MultiSearchRequestSchema } from 'typesense/lib/Typesense/MultiSearch.js'

import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

import Episode from '#models/episode'

import OpenAiService from '#services/open_ai_service'
import TypesenseService from '#services/typesense_service'

// import Episode from '#models/episode'

@inject()
export default class EpisodesController {
  constructor(
    protected openAiService: OpenAiService,
    protected typesenseService: TypesenseService
  ) {}

  async search({ request, view }: HttpContext) {
    const q = request.input('q', '*')

    try {
      const payload: MultiSearchRequestSchema = {
        collection: 'episodes',
        q,
      }

      const sort_by: string[] = []

      if (q !== '*') {
        try {
          const vector = await this.openAiService.embedding(q)
          payload.vector_query = `transcriptionEmbedding:(${JSON.stringify(vector)})`
          sort_by.push('_vector_distance:desc')
        } catch (error) {
          logger.error({ error })

          payload.vector_query = undefined
        }
      }

      sort_by.push('_text_match:desc')
      payload.sort_by = sort_by.join(',')

      const response = await this.typesenseService.client.multiSearch.perform<
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
          query_by: 'summary,transcription,title',
          exclude_fields: 'transcriptionEmbedding',
          per_page: 30,
        }
      )

      const episodes = response.results.at(0)
      return view.render('pages/home', { episodes })
    } catch (error) {
      logger.error({ error })
      return { error }
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

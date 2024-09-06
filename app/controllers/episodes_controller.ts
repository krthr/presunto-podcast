import type { HttpContext } from '@adonisjs/core/http'
import type { MultiSearchRequestSchema } from 'typesense/lib/Typesense/MultiSearch.js'

import { inject } from '@adonisjs/core'

import OpenAiService from '#services/open_ai_service'
import TypesenseService from '#services/typesense_service'
import logger from '@adonisjs/core/services/logger'

// import Episode from '#models/episode'

@inject()
export default class EpisodesController {
  constructor(
    protected openAiService: OpenAiService,
    protected typesenseService: TypesenseService
  ) {}

  async index({ request }: HttpContext) {
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
          payload.vector_query = `transcription_embedding:(${JSON.stringify(vector)})`
          sort_by.push('_vector_distance:desc')
        } catch (error) {
          logger.error({ error })

          payload.vector_query = undefined
        }
      }

      sort_by.push('_text_match:desc')
      payload.sort_by = sort_by.join(',')

      const response = await this.typesenseService.client.multiSearch.perform(
        {
          searches: [payload],
        },
        {
          query_by: 'summary,transcription,title',
          exclude_fields: 'transcription_embedding',
        }
      )

      return response
    } catch (error) {
      logger.error({ error })
      return { error }
    }
  }
}

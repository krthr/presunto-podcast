import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'

import OpenAiService from '#services/open_ai_service'
import TypesenseService from '#services/typesense_service'
import logger from '@adonisjs/core/services/logger'
import { MultiSearchRequestSchema } from 'typesense/lib/Typesense/MultiSearch.js'

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
        sort_by: '_vector_distance:desc,_text_match:desc',
      }

      if (q !== '*') {
        const vector = await this.openAiService.embedding(q)
        payload.vector_query = `transcription_embedding:(${JSON.stringify(vector)})`
      }

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

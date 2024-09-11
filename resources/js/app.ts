import type { HttpContext } from '@adonisjs/core/http'
import type { MultiSearchRequestSchema } from 'typesense/lib/Typesense/MultiSearch.js'


import Episode from '#models/episode'
import SearchService from '#services/search_service'
import { searchEpisodesValidator } from '#validators/search'

@inject()
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

import Episode from '#models/episode'
import TypesenseService from '#services/typesense_service'

import { searchEpisodesValidator } from '#validators/search'

@inject()
export default class EpisodesController {
  constructor(protected typesenseService: TypesenseService) {}

  async index({ session, view }: HttpContext) {
    session.forget('q')

    const episodes = await Episode.query()
    return view.render('pages/index', { episodes })
  }

  async search({ request, response, session, view }: HttpContext) {
    try {
      let { page, q } = await request.validateUsing(searchEpisodesValidator)

      if (!q) {
        return response.redirect('/')
      }

      const payload: MultiSearchRequestSchema = {
        collection: 'episodes_2024_09_08_22_54',
        q,
        sort_by: '_text_match:desc,publishedAt:desc',
      }

      const { results } = await this.typesenseService.client.multiSearch.perform<
        Pick<
          Episode,
          | 'id'
          | 'acastEpisodeId'
          | 'title'
          | 'audioUrl'
          | 'url'
          | 'image'
          | 'description'
          | 'slug'
          | 'publishedAt'
          | 'transcriptionText'
        >[]
      >(
        {
          searches: [payload],
        },
        {
          query_by: 'transcriptionText,title',
          page,
          per_page: 250,
          highlight_affix_num_tokens: 10,
        }
      )

      session.put('q', q)

      const episodes = results.at(0)?.hits?.map(({ document, highlight }) => {
        return {
          ...document,
          highlight,
        }
      })

      const found = results.at(0)?.found || 0

      return view.render('pages/search', { episodes, found })
    } catch (error) {
      logger.error({ error })

      return response.redirect('/')
    }
  }

  async show({ request, response, view }: HttpContext) {
    const id = request.param('id')
    const episode = await Episode.query().where('acastEpisodeId', id).orWhere('slug', id).first()

    if (episode) {
      return view.render('pages/episode', { episode })
    }

    return response.redirect('/')
  }
}

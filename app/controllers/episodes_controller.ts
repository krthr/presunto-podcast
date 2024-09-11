import type { HttpContext } from '@adonisjs/core/http'

import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

import Episode from '#models/episode'

import { searchEpisodesValidator } from '#validators/search'
import SearchService from '#services/search_service'

@inject()
export default class EpisodesController {
  constructor(protected searchService: SearchService) {}

  async search({ request, session, view }: HttpContext) {
    try {
      let { page, q } = await request.validateUsing(searchEpisodesValidator)
      if (!q) {
        q = '*'
      }

      const results = await this.searchService.search(q, page)
      if (q != '*') {
        session.put('q', q)
      } else {
        session.forget('q')
      }

      return view.render('pages/search', results)
    } catch (error) {
      logger.error({ error })
      return view.render('pages/search', {})
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

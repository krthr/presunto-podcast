import type { HttpContext } from '@adonisjs/core/http'

import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

import Episode from '#models/episode'
import SearchService from '#services/search_service'
import { searchEpisodesValidator } from '#validators/search'

@inject()
export default class EpisodesController {
  constructor(protected searchService: SearchService) {}

  async index({ session, view }: HttpContext) {
    session.forget('q')

    const episodes = await Episode.query()
    return view.render('pages/index', { episodes })
  }

  async search({ request, response, session, view }: HttpContext) {
    try {
      const { page, q } = await request.validateUsing(searchEpisodesValidator)

      const results = await this.searchService.search(q, page)
      if (!results) {
        return response.redirect('/')
      }

      session.put('q', results.q)

      return view.render('pages/search', results)
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

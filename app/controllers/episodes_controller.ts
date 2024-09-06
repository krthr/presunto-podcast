import type { HttpContext } from '@adonisjs/core/http'

import Episode from '#models/episode'

export default class EpisodesController {
  async index() {
    const episodes = await Episode.all()
    return episodes
  }
}

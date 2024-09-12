import { inject } from '@adonisjs/core'
import { MultiSearchRequestSchema } from 'typesense/lib/Typesense/MultiSearch.js'

import Episode from '#models/episode'
import TypesenseService from '#services/typesense_service'

type SelectedFields = Pick<
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
  | 'images'
  | 'acastShowId'
>

@inject()
export default class SearchService {
  constructor(protected typesenseService: TypesenseService) {}

  async search(q?: null | string, page = 1, perPage = 12) {
    if (!q) {
      return
    }

    const payload: MultiSearchRequestSchema = {
      collection: 'episodes_2024_09_11_21_33',
      q,
      sort_by: '_text_match:desc,publishedAt:desc',
    }

    const { results } = await this.typesenseService.client.multiSearch.perform<SelectedFields[]>(
      {
        searches: [payload],
      },
      {
        query_by: 'transcriptionText,title',
        page,
        per_page: perPage,
        highlight_affix_num_tokens: 10,
      }
    )

    const episodes = results.at(0)?.hits?.map(({ document, highlight }) => {
      return {
        ...document,
        highlight,
      }
    })

    const total = results.at(0)?.found || 0
    const resultsPage = results.at(0)?.page
    let nextPage: number | undefined
    let prevPage: number | undefined

    if (resultsPage) {
      if (total > resultsPage * perPage) {
        nextPage = resultsPage + 1
      }

      if (resultsPage > 1) {
        prevPage = resultsPage - 1
      }
    }

    let totalPages = Math.ceil(total / perPage)

    return { episodes, total, q, page: resultsPage, perPage, nextPage, prevPage, totalPages }
  }
}

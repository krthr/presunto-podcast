import { inject } from '@adonisjs/core'
import { MultiSearchRequestSchema } from 'typesense/lib/Typesense/MultiSearch.js'

import Episode from '#models/episode'
import TypesenseService from '#services/typesense_service'

type SelectedFields =
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

@inject()
export default class SearchService {
  constructor(protected typesenseService: TypesenseService) {}

  async search(q?: null | string, page = 1, limit = 250) {
    if (!q) {
      return
    }

    const payload: MultiSearchRequestSchema = {
      collection: 'episodes_2024_09_11_18_09',
      q,
      sort_by: '_text_match:desc,publishedAt:desc',
    }

    const { results } = await this.typesenseService.client.multiSearch.perform<
      Pick<Episode, SelectedFields>[]
    >(
      {
        searches: [payload],
      },
      {
        query_by: 'transcriptionText,title',
        page,
        per_page: 250,
        highlight_affix_num_tokens: 10,
        limit,
      }
    )

    const episodes = results.at(0)?.hits?.map(({ document, highlight }) => {
      return {
        ...document,
        highlight,
      }
    })

    const found = results.at(0)?.found || 0

    return { episodes, found, q }
  }
}

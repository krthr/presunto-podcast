import type {
  CollectionCreateOptions,
  CollectionCreateSchema,
} from 'typesense/lib/Typesense/Collections.js'

import env from '#start/env'
import { Client } from 'typesense'

export default class TypesenseService {
  public readonly client: Client

  constructor() {
    this.client = new Client({
      apiKey: env.get('TYPESENSE_API_KEY'),
      nodes: [{ url: env.get('TYPESENSE_HOST') }],
    })
  }

  async getOrCreateCollection(schema: CollectionCreateSchema, options?: CollectionCreateOptions) {
    const name = schema.name

    const collections = await this.client.collections().retrieve()
    const col = collections.filter((c) => c.name === name)

    if (col) {
      return
    }

    await this.client.collections().create(schema, options)
  }

  async index(name: string, document: object) {
    await this.client.collections(name).documents().upsert(document)
  }
}

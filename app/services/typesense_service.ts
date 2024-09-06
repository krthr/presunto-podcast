import type {
  CollectionCreateOptions,
  CollectionCreateSchema,
} from 'typesense/lib/Typesense/Collections.js'

import env from '#start/env'
import { Client } from 'typesense'
import logger from '@adonisjs/core/services/logger'

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

    logger.info(`getting or creating collection: ${name}`)

    const collections = await this.client.collections().retrieve()

    logger.info(`found ${collections.length} collections`)

    const col = collections.filter((c) => c.name === name)[0]

    if (col) {
      logger.info({ col }, 'collection found')
      return
    }

    logger.info(`collection not found. creating a new one`)
    await this.client.collections().create(schema, options)
  }

  async index(name: string, document: object) {
    await this.client.collections(name).documents().upsert(document)
  }
}

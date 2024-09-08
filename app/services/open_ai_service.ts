import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

import OpenAI from 'openai'

@inject()
export default class OpenAiService {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI()
  }

  async completion(input: string) {
    logger.info('generating completion')

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: input }],
    })

    return response.choices[0].message.content
  }

  async embedding(input: string) {
    logger.info('generating embedding')

    const embedding = await this.openai.embeddings.create({
      input,
      model: 'text-embedding-3-small',
      encoding_format: 'float',
    })

    return embedding.data[0].embedding
  }
}

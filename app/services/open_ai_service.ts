import { inject } from '@adonisjs/core'
import { createReadStream } from 'fs'
import OpenAI from 'openai'

@inject()
export default class OpenAiService {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI()
  }

  async completion(input: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: input }],
    })

    return response.choices[0].message.content
  }

  async transcribeAudio(path: string) {
    const transcription = await this.openai.audio.transcriptions.create({
      file: createReadStream(path),
      model: 'whisper-1',
      response_format: 'json',
    })

    return transcription.text
  }

  async embedding(input: string) {
    const embedding = await this.openai.embeddings.create({
      input,
      model: 'text-embedding-3-large',
      encoding_format: 'float',
    })

    return embedding.data[0].embedding
  }
}

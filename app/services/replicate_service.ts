import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

import env from '#start/env'

import Replicate from 'replicate'
import { readFile } from 'node:fs/promises'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

const transcriptionBodyValidator = vine.compile(
  vine.object({
    text: vine.string(),
    chunks: vine.array(
      vine.object({
        text: vine.string(),
        timestamp: vine.array(vine.number().nullable()),
      })
    ),
  })
)

export type TranscriptionBody = Infer<typeof transcriptionBodyValidator>

@inject()
export default class ReplicateService {
  private replicate: Replicate

  constructor() {
    this.replicate = new Replicate({
      auth: env.get('REPLICATE_API_TOKEN'),
    })
  }

  async transcribeAudio(path: string) {
    logger.info({ path }, 'transcribing')

    const audio = await readFile(path)

    const response = await this.replicate.run(
      'vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c',
      {
        input: {
          task: 'transcribe',
          audio,
          language: 'spanish',
          timestamp: 'chunk',
          batch_size: 64,
          diarise_audio: false,
        },
      }
    )

    return transcriptionBodyValidator.validate(response)
  }
}

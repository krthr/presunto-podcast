import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import Episode from '#models/episode'

export const rawAudiosPath = app.tmpPath('audios', 'raw')

export function getRawAudioFilePath(episode: Episode) {
  return join(rawAudiosPath, `${episode.acastEpisodeId}.mp3`)
}

export default class AudioService {
  constructor() {
    logger.info('creating audios folder')
    mkdirSync(rawAudiosPath, { recursive: true })
  }

  public async downloadAudio(episode: Episode) {
    const rawAudioFilePath = join(rawAudiosPath, `${episode.acastEpisodeId}.mp3`)

    if (existsSync(rawAudioFilePath)) {
      logger.info(`raw audio already exists in ${rawAudioFilePath}`)
      return
    }

    logger.info(`downloading audio to ${rawAudioFilePath}`)

    if (!episode.audioUrl) {
      throw `No audio URL.`
    }

    const response = await fetch(episode.audioUrl)
    const body = await response.blob()

    const buff = Buffer.from(await body.arrayBuffer())
    writeFileSync(rawAudioFilePath, buff)
  }
}

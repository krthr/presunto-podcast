import Episode from '#models/episode'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import FfmpegService from '#services/ffmpeg_service'
import { inject } from '@adonisjs/core'

export const rawAudiosPath = app.tmpPath('audios', 'raw')
export const processedAudiosPath = app.tmpPath('audios', 'processed')

export function getRawAudioFilePath(episode: Episode) {
  return join(rawAudiosPath, `${episode.acastEpisodeId}.mp3`)
}

export function getProcessedAudioFilePath(episode: Episode) {
  return join(processedAudiosPath, `${episode.acastEpisodeId}.mp3`)
}

@inject()
export default class AudioService {
  constructor(protected ffmpegService: FfmpegService) {
    logger.info('creating audios folders')

    mkdirSync(rawAudiosPath, { recursive: true })
    mkdirSync(processedAudiosPath, { recursive: true })
  }

  public async downloadAudio(episode: Episode) {
    const rawAudioFilePath = join(rawAudiosPath, `${episode.acastEpisodeId}.mp3`)

    if (existsSync(rawAudioFilePath)) {
      logger.info(`raw audio already exists in ${rawAudioFilePath}`)
      return
    }

    logger.info(`downloading audio to ${rawAudioFilePath}`)

    const response = await fetch(episode.audioUrl)
    const body = await response.blob()

    const buff = Buffer.from(await body.arrayBuffer())
    writeFileSync(rawAudioFilePath, buff)
  }

  public async processAudio(episode: Episode) {
    const rawAudioFilePath = getRawAudioFilePath(episode)
    const processedAudioFilePath = getProcessedAudioFilePath(episode)

    if (existsSync(processedAudioFilePath)) {
      logger.info(`processed audio already exists in ${processedAudioFilePath}`)
      return
    }

    logger.info(`processing audio ${rawAudioFilePath}`)

    await this.ffmpegService.compress(rawAudioFilePath, processedAudioFilePath)
  }
}

import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

import FfmpegCommand from 'fluent-ffmpeg'

@inject()
export default class FfmpegService {
  async compress(source: string, target: string) {
    FfmpegCommand({
      logger: {
        error(data) {
          logger.error(data)
        },
        warn(data) {
          logger.warn(data)
        },
        debug() {},
        info() {},
      },
    })
      .addInput(source)
      .audioBitrate(40)
      .audioChannels(1)
      .audioFilter('atempo=1.2')
      .output(target)
      .on('progress', (a) => {
        logger.info(a)
      })
      .run()
  }
}

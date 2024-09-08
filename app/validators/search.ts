import vine from '@vinejs/vine'

export const searchEpisodesValidator = vine.compile(
  vine.object({
    page: vine
      .number()
      .transform((v) => {
        if (!v) {
          return
        }

        const tmp = Number(v)
        if (Number.isInteger(tmp) && tmp > 0) {
          return tmp
        }
      })
      .optional(),
    q: vine.string().trim().optional(),
  })
)

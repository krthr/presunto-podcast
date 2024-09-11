import edge from 'edge.js'
import { DateTime } from 'luxon'
import { marked } from 'marked'

// import env from '#start/env'

edge.global('markdown', (value: string) => marked.parse(value))
edge.global('humanDate', (value: number | DateTime) => {
  if (typeof value === 'number') {
    value = DateTime.fromSeconds(value)
  }

  return value.toLocaleString({
    month: 'short',
    year: 'numeric',
    day: '2-digit',
  })
})

edge.global('img', (imgUrl: string, options: Record<string, string> = {}) => {
  const tr = Object.entries({
    ...options,
    quality: '80',
    pr: 'true',
  })
    .map(([k, v]) => `${k}-${v}`)
    .join(',')

  const param = new URLSearchParams({ tr })

  const url = new URL('https://ik.imagekit.io/krthr/' + imgUrl + '?' + param.toString())
  return url.toString()
})

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

edge.global('img', (imgUrl: string, options = { quality: '70', pr: 'true' }) => {
  const param = new URLSearchParams(options)
  const url = new URL('https://ik.imagekit.io/krthr/' + imgUrl + '?' + param.toString())
  return url.toString()
})

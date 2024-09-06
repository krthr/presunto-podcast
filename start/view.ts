import edge from 'edge.js'
import { DateTime } from 'luxon'
import { marked } from 'marked'

// import env from '#start/env'

edge.global('markdown', (value: string) => marked.parse(value))
edge.global('humanDate', (value: number) =>
  DateTime.fromSeconds(value).toLocaleString({
    month: 'short',
    year: 'numeric',
    day: '2-digit',
  })
)

import edge from 'edge.js'
import { marked } from 'marked'

// import env from '#start/env'

edge.global('markdown', (value: string) => marked.parse(value))

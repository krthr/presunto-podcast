export function buildImageUrl(imgUrl: string, options: Record<string, boolean | string | number>) {
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
}

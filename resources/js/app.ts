/// <reference lib="dom" />

import 'iconify-icon'

declare global {
  interface Window {
    LazyLoad: any
    lazyContent: any
  }
}

window['lazyContent'] = new window['LazyLoad']({
  use_native: true, // <-- there you go
})

console.log('Log from JS entrypoint')

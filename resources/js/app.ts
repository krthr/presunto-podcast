/// <reference lib="dom" />
/// <reference types="vite/client" />

import.meta.glob(['../images/**'])
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

import 'vanilla-lazyload'
import 'iconify-icon'

console.log('Log from JS entrypoint')

const lazyContent = new window.LazyLoad({
  use_native: true, // <-- there you go
})

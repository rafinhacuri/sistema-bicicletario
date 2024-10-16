export default defineNuxtRouteMiddleware(async (to, from) => {
  const pages = [
    '/',
    '/login',
  ]

  if(to.meta.pageTransition && typeof to.meta.pageTransition === 'object'){
    const indexTo = pages.indexOf(to.fullPath)
    const indexFrom = pages.indexOf(from.fullPath)
    to.meta.pageTransition.name = indexTo < indexFrom ? 'slide-right' : 'slide-left'
  }
})

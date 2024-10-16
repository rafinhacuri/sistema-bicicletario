export default defineNuxtRouteMiddleware(async to => {
  const { loggedIn, fetch } = useUserSession()

  // * Atualizando a sessão
  await fetch()

  // * Logado tentando acessar login
  if(loggedIn.value && to.fullPath === '/login') return navigateTo('/')
})

export default defineNuxtRouteMiddleware(async to => {
  const { loggedIn, fetch, user } = useUserSession()

  // * Atualizando a sessão
  await fetch()

  // * Logado tentando acessar login
  if(loggedIn.value && to.fullPath === '/login') return navigateTo('/')

  // * Logado tentando acessar login
  if(loggedIn.value && to.fullPath === '/adm' && user.value?.level !== 'Administrador') return navigateTo('/')
})

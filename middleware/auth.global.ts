export default defineNuxtRouteMiddleware(async to => {
  const { loggedIn, fetch, user } = useUserSession()

  // * Atualizando a sessão
  await fetch()

  // * Logado tentando acessar login
  if(loggedIn.value && to.fullPath === '/login') return navigateTo('/')

  // * Logado tentando acessar login
  if(loggedIn.value && to.fullPath === '/adm' && user.value?.level !== 'Administrador') return navigateTo('/')

  // * nao Logado tentando acessar aluguel
  if(!loggedIn.value && to.fullPath === '/alugue') return navigateTo('/login')

  // * nao Logado tentando acessar adm
  if(!loggedIn.value && to.fullPath === '/adm') return navigateTo('/login')

  // * adm tentando acessar cadastro
  if(to.fullPath.startsWith('/user/') && user.value?.level === 'Administrador') return navigateTo('/')

  // * nao Logado tentando acessar cadastro
  if(to.fullPath.startsWith('/user/') && !loggedIn.value) return navigateTo('/login')

  if(user.value?.level === 'Administrador' && to.fullPath === '/alugue') return navigateTo('/')

  if(to.fullPath === '/alugue'){
    // * Verificando se o usuário tem permissão de alugar
    const { data } = await useFetch('/api/fetch/user', { method: 'post', body: { user: user.value?.email } })

    if(data.value){
      if(!data.value.cpf || !data.value.cpfCartao || !data.value.numeroCartao || !data.value.nomeCartao || !data.value.dataValidade || !data.value.cvv || !data.value.dadosBancarios){
        const toast = useToast()

        toast.add({ title: 'Finalize seu Cadastro Para Alugar', icon: 'i-heroicons-exclamation-triangle', color: 'red' })

        return navigateTo(`/user/${user.value?.email}`)
      }
    }
  }
})

<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

const { data } = await useFetch('/api/fetch/user', { method: 'post', body: { user: user.value?.email } })

const menuClosed = ref(true)

const menu = ref<{ nome: string, to: string, nivel: null | string[] }[]>([
  { nome: 'Início', to: '/', nivel: null },
  { nome: 'Alugue', to: `/alugue`, nivel: ['Usuário'] },
  { nome: 'Perfil', to: `/user/${user.value?.email}`, nivel: ['Usuário'] },
  { nome: 'Gerencia', to: `/adm`, nivel: ['Administrador'] },
])

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const themeMenu = computed(() => [[
  { label: 'Sistema', icon: 'i-heroicons-computer-desktop-20-solid', click: () => colorMode.preference = 'system' },
  { label: 'Claro', icon: 'i-heroicons-sun-20-solid', click: () => colorMode.preference = 'light' },
  { label: 'Escuro', icon: 'i-heroicons-moon-20-solid', click: () => colorMode.preference = 'dark' },
]])

const userMenu = computed(() => [
  [
    { label: user.value?.nome || 'Usuário', icon: 'i-heroicons-user-circle', click: () => user.value?.level === 'Administrador' ? '' : navigateTo(`/user/${user.value?.email}`) },
    { label: user.value?.level || 'Level', icon: 'i-heroicons-ticket' },
  ],
  [{ label: 'Sair', icon: 'i-heroicons-arrow-right-on-rectangle', click: logout }],
])

async function logout(){
  await clear()
  navigateTo('/login')
}
</script>

<template>
  <nav class="bg-slate-50 dark:bg-gray-800">
    <div class="mx-auto flex max-w-screen-xl flex-wrap items-center justify-center p-4 sm:justify-between">
      <NuxtLink to="/" class="flex items-center">
        <ClientOnly>
          <img src="/logo.png" class="mr-3 h-8" alt="Logo do Bicicletario">
          <template #fallback>
            <USkeleton class="mr-3 size-8" :ui="{ rounded: 'rounded-full', background: 'bg-gray-300 dark:bg-gray-600' }" />
          </template>
        </ClientOnly>
        <span class="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">Bicicletario</span>
      </NuxtLink>
      <div class="mt-4 flex items-center space-x-4 sm:mt-0 lg:order-2">
        <UDropdown v-if="loggedIn" :items="userMenu" :popper="{ placement: 'bottom-start' }">
          <img v-if="data && data.foto" :src="`/imagem/${data.foto}`" class="size-8 rounded-full" alt="Logo do Bicicletario">
          <img v-else class="size-8 rounded-full" src="/icone.jpg" alt="user">
        </UDropdown>
        <UButton v-else icon="i-heroicons-arrow-left-on-rectangle" size="sm" color="gray" variant="solid" label="Acessar" to="/login" />
        <ClientOnly>
          <UDropdown :items="themeMenu" :popper="{ placement: 'bottom-start' }">
            <UButton :icon="colorMode.preference === 'system' ? 'i-heroicons-computer-desktop-20-solid' : colorMode.preference === 'light' ? 'i-heroicons-sun-20-solid' : 'i-heroicons-moon-20-solid'" color="gray" aria-label="Tema" @click="isDark = !isDark" />
          </UDropdown>
          <template #fallback>
            <USkeleton class="ms-4 size-8" :ui="{ background: 'bg-gray-300 dark:bg-gray-600' }" />
          </template>
        </ClientOnly>
        <button class="ms-2 inline-flex size-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" @click="menuClosed = !menuClosed">
          <svg class="size-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
          </svg>
        </button>
      </div>
      <div class="w-full items-center justify-between lg:order-1 lg:flex lg:w-auto" :class="{ hidden: menuClosed }">
        <ul class="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium lg:mt-0 lg:flex-row lg:space-x-8 lg:border-0 lg:bg-slate-50 lg:p-0 dark:border-gray-700 dark:bg-gray-800 lg:dark:bg-gray-800">
          <template v-for="{ nome, to, nivel } in menu" :key="to">
            <li v-if="nivel === null || nivel.includes(user?.level || '')">
              <NuxtLink :to class="block rounded py-2 pl-3 pr-4 text-gray-900 hover:bg-gray-100 lg:p-0 lg:hover:bg-transparent lg:hover:text-blue-700 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent lg:dark:hover:text-blue-500" active-class="text-white bg-blue-700 lg:bg-transparent lg:text-blue-700 lg:dark:text-blue-500" @click="menuClosed = true">
                {{ nome }}
              </NuxtLink>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

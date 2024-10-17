<script setup lang="ts">
import type { BikeMongo } from '~/schemas/bicicleta'

const { user } = useUserSession()

const { data: dataUsers } = await useFetch('/api/fetch/users')

const { data: dataBikes } = await useFetch('/api/fetch/bikes')

const bikesAlugadas = computed(() => dataBikes.value ? dataBikes.value.filter((bike: BikeMongo) => bike.status === 'Alugada') : [])

const bikesNaoAlugadas = computed(() => dataBikes.value ? dataBikes.value.filter((bike: BikeMongo) => bike.status === 'Disponível') : [])

const servicos = computed(() => [
  { titulo: 'USUÁRIOS', icone: 'heroicons:user', quantidade: dataUsers.value ? dataUsers.value.length : 0, rodape: 'Total de Usuários' },
  { titulo: 'BICICLETAS', icone: 'heroicons:chart-pie', quantidade: dataBikes.value ? dataBikes.value.length : 0, rodape: 'Total de Bicicletas' },
  { titulo: 'ALUGADAS', icone: 'heroicons:lock-open', quantidade: bikesAlugadas.value.length, rodape: 'Total de Bicicletas alugadas' },
  { titulo: 'NÃO ALUGADAS', icone: 'heroicons:lock-closed', quantidade: bikesNaoAlugadas.value.length, rodape: 'Total de Bicicletas não alugadas' },
])
</script>

<template>
  <section>
    <div v-if="user?.level === 'Administrador'">
      <div class="my-10 flex items-center justify-center space-x-10">
        <UCard v-for="{titulo, icone, quantidade, rodape} in servicos" :key="titulo" class="drop-shadow-[0_1px_2px_rgba(180,180,180,0.2)]" :ui="{ header: { base: 'dark:bg-[#0e1a36]' }, body: { base: 'dark:bg-[#0e1a36] ' }, footer: { base: 'dark:bg-[#0e1a36] ' }, }">
          <span class="block text-right text-[20px] font-bold">
            {{ titulo }}
          </span>
          <div class="flex items-center justify-between space-x-20">
            <Icon :name="icone" class="mr-2 size-24 group-hover:text-sky-600" />
            <span class="text-2xl font-bold">
              {{ quantidade }}
            </span>
          </div>
          <template #footer>
            <p class="px-6 py-4 text-center dark:text-gray-300">
              {{ rodape }}
            </p>
          </template>
        </UCard>
      </div>
    </div>
  </section>
</template>

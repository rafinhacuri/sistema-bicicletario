<script setup lang="ts">
import type { BikeMongo } from '~/schemas/bicicleta'

definePageMeta({ pageTransition: { name: 'slide-right', mode: 'out-in' } })
useHead({ title: 'Conheça' })
useSeoMeta({ description: 'Explore nossas bicicletas' })
defineOgImageComponent('NuxtSeo', { theme: '#3b82f6', colorMode: 'dark' })

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

const items = computed(() => {
  const fotos: string[] = []
  if(dataBikes.value){
    if(dataBikes.value && dataBikes.value.length > 0) for(const { foto } of dataBikes.value) if(foto) fotos.push(`/foto/${foto}`)
    return fotos
  }
  return []
})

const carouselRef = ref()
onMounted(() => {
  setInterval(() => {
    if(!carouselRef.value) return

    if(carouselRef.value.page === carouselRef.value.pages) return carouselRef.value.select(0)

    carouselRef.value.next()
  }, 3000)
})

async function irAlugue(){
  await navigateTo('/alugue')
}
</script>

<template>
  <section>
    <div v-if="user?.level === 'Administrador'">
      <div class=" mt-12 flex items-center justify-center space-x-10">
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
    <div v-else>
      <div v-if="items.length < 1" class="text-center">
        Nenhuma Bicicleta Encontrada.
      </div>
      <div v-else class="flex flex-col items-center justify-center">
        <div class="my-8 flex flex-col items-center justify-center space-y-5">
          <h2 class="text-center text-4xl font-bold text-gray-900 drop-shadow-[0_0_10px_rgba(0,255,204,0.75)] dark:text-white">
            Conheça nossas bicicletas
          </h2>
          <UButton color="green" variant="outline" :ui="{ rounded: 'rounded-full' }" icon="i-heroicons-bolt" label="Quero Alugar Uma" @click="irAlugue" />
        </div>

        <UCarousel ref="carouselRef" v-slot="{ item }" :items="items" :ui="{ item: 'basis-full' }" class="mb-10 w-full overflow-hidden rounded-lg md:w-3/5" arrows indicators>
          <img :src="item" class="w-full" draggable="false" :alt="item">
        </UCarousel>
      </div>
    </div>
  </section>
</template>

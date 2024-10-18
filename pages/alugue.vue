<script setup lang="ts">
import type { Alugue, FimAlugue } from '~/schemas/alugar'
import { AlugueSchema, FimAlugueSchema } from '~/schemas/alugar'

const codigoBike = ref('')

const comp = computed(() => codigoBike.value)

const { data } = await useFetch('/api/fetch/bike', { method: 'post', body: { codigo: comp } })

const { user } = useUserSession()
const { data: dataUsers, refresh: refreshUser } = await useFetch('/api/fetch/user', { method: 'post', body: { user: user.value?.email } })

const { data: dataAluguel, refresh: refreshBike } = await useFetch('/api/fetch/aluguel', { method: 'post', body: { user: user.value?.email } })

const compPagar = computed(() => dataAluguel.value ? dataAluguel.value.codigo : '')

const { data: dataPagar } = await useFetch('/api/fetch/bike', { method: 'post', body: { codigo: compPagar } })

function formatarData(data: Date){
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const toast = useToast()

const { start, finish, isLoading } = useLoadingIndicator()

async function alugar(){
  start()

  const state = ref<Alugue>({ codigo: codigoBike.value, email: user.value ? user.value.email : '' })

  const body = AlugueSchema.safeParse(state.value)

  if(!body.success){
    finish()
    return toast.add({ title: body.error.errors[0].message, icon: 'i-heroicons-exclamation-triangle', color: 'red' })
  }

  const res = await $fetch('/api/insert/alugar', { method: 'post', body: body.data })
    .catch(error => { toast.add({ title: error.data.message, icon: 'i-heroicons-exclamation-triangle', color: 'red' }) })

  if(!res) return finish({ error: true })

  finish()
  refreshBike()
  refreshUser()
  toast.add({ title: res, icon: 'i-heroicons-check-badge', color: 'green' })
  codigoBike.value = ''
}

const modalfinalizarAluguel = ref(false)
const datafinalAluguel = ref(new Date())
const idFim = ref('')
const minutosTotais = ref(0)

const valorFinal = computed(() => {
  if(dataAluguel.value && dataPagar.value){
    const dataInicio = new Date(dataAluguel.value.dataInicio)
    const dataFim = new Date(datafinalAluguel.value)
    const diff = Math.abs(dataFim.getTime() - dataInicio.getTime())
    const minutos = Math.ceil(diff / (1000 * 60))
    minutosTotais.value = minutos
    return dataPagar.value.precoMinuto * minutos
  }
})

function abrirModalFinalizarAluguel(){
  idFim.value = dataAluguel.value ? dataAluguel.value._id : ''
  modalfinalizarAluguel.value = true
}

async function finalizarAluguel(){
  start()

  const state = ref<FimAlugue>({ codigo: dataAluguel.value ? dataAluguel.value.codigo : '', email: user.value ? user.value.email : '', dataFim: datafinalAluguel.value.toString(), id: idFim.value, valor: valorFinal.value ? valorFinal.value : 0 })

  const body = FimAlugueSchema.safeParse(state.value)

  if(!body.success){
    finish()
    return toast.add({ title: body.error.errors[0].message, icon: 'i-heroicons-exclamation-triangle', color: 'red' })
  }

  const res = await $fetch('/api/update/alugar', { method: 'post', body: body.data })
    .catch(error => { toast.add({ title: error.data.message, icon: 'i-heroicons-exclamation-triangle', color: 'red' }) })

  if(!res) return finish({ error: true })

  finish()
  refreshBike()
  refreshUser()
  toast.add({ title: res, icon: 'i-heroicons-check-badge', color: 'green' })
  codigoBike.value = ''
  modalfinalizarAluguel.value = false
}
</script>

<template>
  <section>
    <div v-if="dataUsers && !dataUsers.devedor">
      <div class="container mx-auto mt-10">
        <div class="flex flex-col items-center justify-center">
          <div class="w-full max-w-md rounded-xl bg-white p-8 shadow-xl dark:bg-gray-800">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="codigo">Insira o Código da Bicicleta</label>
            <UInput id="codigo" v-model="codigoBike" icon="i-heroicons-cpu-chip" class="mt-4 w-full" />
          </div>
        </div>
        <div v-if="data" class="my-12">
          <div class="mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl transition-transform duration-300 hover:scale-105 dark:bg-gray-800">
            <div class="md:flex">
              <div v-if="data.foto" class="md:w-1/2">
                <img :src="`/foto/${data.foto}`" alt="Foto da Bicicleta" class="size-full object-cover">
              </div>
              <div class="p-10 md:w-1/2">
                <h2 class="mb-6 text-4xl font-extrabold text-gray-800 dark:text-white">
                  Modelo: {{ data.modelo }}
                </h2>
                <p class="mb-6 text-xl text-gray-600 dark:text-gray-300">
                  Marca: <span class="font-semibold">{{ data.marca }}</span>
                </p>
                <div class="grid grid-cols-1 gap-6">
                  <div class="flex items-center">
                    <UIcon name="i-heroicons-banknotes" class="size-8" />
                    <span class="ml-4 text-lg text-gray-700 dark:text-gray-300">Preço por Minuto: <span class="font-bold">R$ {{ data.precoMinuto }}</span></span>
                  </div>
                </div>
                <div class="mt-8">
                  <UButton color="green" variant="solid" :ui="{ rounded: 'rounded-full' }" icon="i-heroicons-bolt" label="Alugar Agora" :disabled="isLoading" @click="alugar" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <UCard class="w-full rounded-2xl  p-8 text-center shadow-2xl">
        <UIcon name="i-heroicons-exclamation-circle" class="mb-6 animate-bounce text-6xl text-red-500" />
        <h2 class="mb-4 text-3xl font-extrabold dark:text-white">
          Você ainda não finalizou seu aluguel atual
        </h2>
        <p class="mb-6 text-lg dark:text-white">
          Finalize agora para alugar outra bicicleta e continuar sua jornada!
        </p>
        <div v-if="dataAluguel">
          <p class="mb-8 text-base dark:text-white">
            Início do aluguel: {{ formatarData(new Date(dataAluguel.dataInicio)) }}
          </p>
          <UButton color="yellow" variant="solid" :ui="{ rounded: 'full', shadow: 'xl' }" icon="i-heroicons-check-badge" label="Finalizar Aluguel" class="px-6 py-3 text-lg transition-transform duration-300 hover:scale-105" @click="abrirModalFinalizarAluguel" />
        </div>
      </UCard>
    </div>

    <UModal v-model="modalfinalizarAluguel" prevent-close :ui="{ width: '!w-3/5 !max-w-none' }">
      <UCard>
        <template #header>
          <h2 class="pt-3 text-center text-xl font-semibold leading-tight text-gray-900 dark:text-white">
            Finalizar Aluguel
          </h2>
        </template>

        <div class="p-6">
          <div v-if="dataPagar" class="mb-6">
            <p class="text-lg font-bold text-gray-800 dark:text-white">
              Valor final a pagar: <span class="text-green-600">R$ {{ valorFinal }}</span>
            </p>
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-700 dark:text-gray-300">
                  <strong>Modelo:</strong> {{ dataPagar.modelo }}
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  <strong>Marca:</strong> {{ dataPagar.marca }}
                </p>
              </div>
              <div>
                <p class="text-gray-700 dark:text-gray-300">
                  <strong>Preço por minuto:</strong> R$ {{ dataPagar.precoMinuto }}
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  <strong>Minutos totais:</strong> {{ minutosTotais }}
                </p>
              </div>
            </div>
          </div>

          <p class="text-center text-lg font-semibold text-gray-800 dark:text-white">
            Ao confirmar, o valor do aluguel será debitado do seu cartão cadastrado.
          </p>
        </div>

        <template #footer>
          <div class="flex justify-center space-x-4 pb-4">
            <UButton label="Confirmar" color="green" icon="i-heroicons-check" :disabled="isLoading" @click="finalizarAluguel" />
            <UButton label="Cancelar" color="red" icon="i-heroicons-no-symbol" :disabled="isLoading" @click="modalfinalizarAluguel = false" />
          </div>
        </template>
      </UCard>
    </UModal>
  </section>
</template>

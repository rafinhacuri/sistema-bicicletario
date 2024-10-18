<script setup lang="ts">
import type { Bike } from '~/schemas/bicicleta'
import { BikeSchema, BikeUpadateSchema } from '~/schemas/bicicleta'

const { user } = useUserSession()
const toast = useToast()

const { start, finish, isLoading } = useLoadingIndicator()

const { data: dataUsers, refresh: refreshUsers } = await useFetch('/api/fetch/users')

const { data: dataBikes, refresh: refreshBikes } = await useFetch('/api/fetch/bikes')

const items = [
  { key: 'bike', label: 'Bicicletas', description: 'Todos as bicicletas' },
  { key: 'user', label: 'Usuários', description: 'Todos os usuários' },
]

const colunasUser = computed(() => [
  { key: 'email', label: 'Email', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true },
  { key: 'sobrenome', label: 'Sobrenome', sortable: true },
  { key: 'cpf', label: 'CPF', sortable: true },
  { key: 'dadosBancarios', label: 'Dados Bancarios', sortable: true },
  user.value?.level === 'Administrador' ? { key: 'acoes', label: 'Ações' } : undefined,
].filter(col => col !== undefined))

const colunasBikes = computed(() => [
  { key: 'codigo', label: 'Codigo', sortable: true },
  { key: 'modelo', label: 'Modelo', sortable: true },
  { key: 'marca', label: 'Marca', sortable: true },
  { key: 'precoMinuto', label: 'Preço por Minuto', sortable: true },
  { key: 'valor', label: 'Valor da Bicicleta', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  user.value?.level === 'Administrador' ? { key: 'acoes', label: 'Ações' } : undefined,
].filter(col => col !== undefined))

const page = ref(1)

const pageCount = ref({ qnt: 10, txt: 'Mostrar 4 Itens' })

const pesquisarUser = ref('')

const filtroUser = computed(() => {
  if(pesquisarUser.value && dataUsers.value){
    return dataUsers.value.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(pesquisarUser.value.toLowerCase())))
  }
  return dataUsers.value
})

const registroUser = computed(() => {
  if(filtroUser.value){
    return filtroUser.value.slice((page.value - 1) * pageCount.value.qnt, page.value * pageCount.value.qnt)
  }
  return filtroUser.value
})

const page2 = ref(1)

const pageCount2 = ref({ qnt: 10, txt: 'Mostrar 4 Itens' })

const pesquisarBikes = ref('')

const filtroBikes = computed(() => {
  if(pesquisarBikes.value && dataBikes.value){
    return dataBikes.value.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(pesquisarBikes.value.toLowerCase())))
  }
  return dataBikes.value
})

const registroBikes = computed(() => {
  if(filtroBikes.value){
    return filtroBikes.value.slice((page2.value - 1) * pageCount2.value.qnt, page2.value * pageCount2.value.qnt)
  }
  return filtroBikes.value
})

const modalInsertBike = ref(false)

const state = ref<Bike>({ codigo: '', modelo: '', marca: '', precoMinuto: 0, valor: 0 })

const foto = ref<File | null>(null)

const { open, onChange } = useFileDialog({ accept: 'image/*', multiple: false })
onChange(file => {
  if(file !== null && file.length > 0){
    [foto.value] = file
    return { title: 'Imagem atualizada com sucesso', icon: 'i-heroicons-check-badge', color: 'green' }
  }
})

async function insertBike(){
  start()

  const body = BikeSchema.safeParse(state.value)

  if(!body.success){
    toast.add({ title: body.error.errors[0].message, icon: 'i-heroicons-exclamation-triangle', color: 'red' })
    return finish({ error: true })
  }

  const formData = new FormData()
  formData.append('foto', foto.value || '')
  formData.append('codigo', body.data.codigo)
  formData.append('modelo', body.data.modelo)
  formData.append('marca', body.data.marca)
  formData.append('precoMinuto', body.data.precoMinuto.toString())
  formData.append('valor', body.data.valor.toString())

  const res = await $fetch('/api/insert/bike', { method: 'post', body: formData })
    .catch(error => { toast.add({ title: error.data.message, icon: 'i-heroicons-exclamation-triangle', color: 'red' }) })

  if(!res) return finish({ error: true })

  finish()
  refreshBikes()
  toast.add({ title: res, icon: 'i-heroicons-check-badge', color: 'green' })
  modalInsertBike.value = false
}

const idEditBike = ref('')
const isEditBike = ref(false)

function abrirEditBike(id: string, codigo: string, modelo: string, marca: string, precoMinuto: number, valor: number){
  isEditBike.value = true
  state.value = { codigo, modelo, marca, precoMinuto, valor }
  idEditBike.value = id
  modalInsertBike.value = true
}

const fotoEdit = ref<File | null>(null)

watch(modalInsertBike, nv => {
  if(!nv){
    isEditBike.value = false
    idEditBike.value = ''
    foto.value = null
    fotoEdit.value = null
    state.value = { codigo: '', modelo: '', marca: '', precoMinuto: 0, valor: 0 }
  }
})

const { open: openEdit, onChange: onChangeEdit } = useFileDialog({ accept: 'image/*', multiple: false })
onChangeEdit(file => {
  if(file !== null && file.length > 0){
    [fotoEdit.value] = file
    return { title: 'Imagem atualizada com sucesso', icon: 'i-heroicons-check-badge', color: 'green' }
  }
})

async function editBike(){
  start()

  const stateFinal = { ...state.value, id: idEditBike.value }

  const body = BikeUpadateSchema.safeParse(stateFinal)

  if(!body.success){
    toast.add({ title: body.error.errors[0].message, icon: 'i-heroicons-exclamation-triangle', color: 'red' })
    return finish({ error: true })
  }

  const formData = new FormData()
  formData.append('foto', fotoEdit.value || '')
  formData.append('id', body.data.id)
  formData.append('codigo', body.data.codigo || '')
  formData.append('modelo', body.data.modelo || '')
  formData.append('marca', body.data.marca || '')
  formData.append('precoMinuto', body.data.precoMinuto ? body.data.precoMinuto.toString() : '')
  formData.append('valor', body.data.valor ? body.data.valor.toString() : '')

  const res = await $fetch('/api/update/bike', { method: 'put', body: formData })
    .catch(error => { toast.add({ title: error.data.message, icon: 'i-heroicons-exclamation-triangle', color: 'red' }) })

  if(!res) return finish({ error: true })

  finish()
  refreshBikes()
  toast.add({ title: res, icon: 'i-heroicons-check-badge', color: 'green' })
  modalInsertBike.value = false
}

const idDeleteBike = ref('')
const modalDeleteBike = ref(false)

function abrirDeleteBike(id: string){
  idDeleteBike.value = id
  modalDeleteBike.value = true
}

async function deleteBike(){
  start()

  const res = await $fetch('/api/delete/bike', { method: 'delete', body: { id: idDeleteBike.value } })
    .catch(error => { toast.add({ title: error.data.message, icon: 'i-heroicons-exclamation-triangle', color: 'red' }) })

  if(!res) return finish({ error: true })

  finish()
  refreshBikes()
  toast.add({ title: res, icon: 'i-heroicons-check-badge', color: 'green' })
  modalDeleteBike.value = false
}

const idDeleteUser = ref('')

const modalDeleteUser = ref(false)

function abrirDeleteUser(id: string){
  idDeleteUser.value = id
  modalDeleteUser.value = true
}

async function deleteUser(){
  start()

  const res = await $fetch('/api/delete/user', { method: 'delete', body: { id: idDeleteUser.value } })
    .catch(error => { toast.add({ title: error.data.message, icon: 'i-heroicons-exclamation-triangle', color: 'red' }) })

  if(!res) return finish({ error: true })

  finish()
  refreshUsers()
  toast.add({ title: res, icon: 'i-heroicons-check-badge', color: 'green' })
  modalDeleteUser.value = false
}
</script>

<template>
  <section>
    <UTabs :items="items" class="mx-8 mt-8">
      <template #item="{ item }">
        <div v-if="item.key === 'user'">
          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <UInput id="pesquisar-pessoas" v-model="pesquisarUser" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Pesquisar Usuário" />
          </div>
          <UTable v-if="registroUser" :rows="registroUser" :columns="colunasUser" :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Carregando...' }" :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Nenhum Usuário encontrado.', }" sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down">
            <template #dadosBancarios-data="{ row }">
              <div class="flex space-x-2">
                {{ row.dadosBancarios ? 'Sim' : 'Não' }}
              </div>
            </template>
            <template #acoes-data="{ row }">
              <div class="flex space-x-2">
                <UTooltip text="Deletar Usuário" :popper="{ placement: 'top' }">
                  <UButton size="2xs" color="red" variant="soft" :ui="{ rounded: 'rounded-full' }" icon="i-heroicons-trash" @click="abrirDeleteUser(row._id)" />
                </UTooltip>
              </div>
            </template>
          </UTable>
          <UPagination v-if="filtroUser" v-model="page" class="flex justify-end" :page-count="pageCount.qnt" :total="filtroUser.length" />
        </div>

        <div v-else-if="item.key === 'bike'">
          <div class="my-4">
            <UButton label="Bicicleta" color="green" icon="i-heroicons-plus" @click="modalInsertBike = true" />
          </div>

          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <UInput id="pesquisar-pessoas" v-model="pesquisarBikes" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Pesquisar Bicicleta" />
          </div>
          <UTable v-if="registroBikes" :rows="registroBikes" :columns="colunasBikes" :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Carregando...' }" :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Nenhuma bicicleta encontrada.', }" sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down">
            <template #codigo-data="{ row }">
              <UBadge size="xs" :label="row.codigo" variant="outline" color="teal" />
            </template>
            <template #acoes-data="{ row }">
              <div class="flex space-x-2">
                <UTooltip text="Editar Bicicleta" :popper="{ placement: 'top' }">
                  <UButton size="2xs" color="blue" variant="soft" :ui="{ rounded: 'rounded-full' }" icon="i-heroicons-pencil-square" @click="abrirEditBike(row._id, row.codigo, row.modelo, row.marca, row.precoMinuto, row.valor)" />
                </UTooltip>
                <UTooltip text="Deletar Bicicleta" :popper="{ placement: 'top' }">
                  <UButton size="2xs" color="red" variant="soft" :ui="{ rounded: 'rounded-full' }" icon="i-heroicons-trash" @click="abrirDeleteBike(row._id)" />
                </UTooltip>
              </div>
            </template>
          </UTable>
          <UPagination v-if="filtroBikes" v-model="page2" class="flex justify-end" :page-count="pageCount2.qnt" :total="filtroBikes.length" />
        </div>
      </template>
    </UTabs>

    <UModal v-model="modalInsertBike" prevent-close :ui="{ width: '!w-3/5 !max-w-none' }">
      <UCard>
        <template #header>
          <h2 class="pt-3 text-center text-xl font-semibold leading-tight text-gray-900 dark:text-white">
            <span v-if="isEditBike">
              Editar Bicicleta
            </span>
            <span v-else>
              Inserir Bicicleta
            </span>
          </h2>
        </template>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="Codigo-Bicicleta">Codigo</label>
            <UInput id="codigo-Bicicleta" v-model="state.codigo" :disabled="isEditBike" icon="i-heroicons-cpu-chip" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="modelo">Modelo</label>
            <UInput id="modelo" v-model="state.modelo" icon="i-heroicons-cube" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="marca">Marca</label>
            <UInput id="marca" v-model="state.marca" icon="i-heroicons-globe-americas" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="preco-por-minuto">Preco por Minuto</label>
            <UInput id="preco-por-minuto" v-model="state.precoMinuto" icon="i-heroicons-banknotes" type="number" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="valor-bicicleta">Valor da Bicicleta</label>
            <UInput id="valor-bicicleta" v-model="state.valor" icon="i-heroicons-currency-dollar" type="number" />
          </div>
          <div v-if="isEditBike">
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="image-perfil">Foto da Bicicleta</label>
            <UButton class="w-full" :color="fotoEdit ? 'green' : 'blue'" :label="fotoEdit ? 'Selecionado' : 'Selecione'" :icon="fotoEdit ? 'i-heroicons-check-circle' : 'i-heroicons-arrow-up-tray'" @click="openEdit()" />
          </div>
          <div v-else>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="image-perfil">Foto da Bicicleta</label>
            <UButton class="w-full" :color="foto? 'green' : 'blue'" :label="foto? 'Selecionado' : 'Selecione'" :icon="foto ? 'i-heroicons-check-circle' : 'i-heroicons-arrow-up-tray'" @click="open()" />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-center space-x-4">
            <UButton v-if="isEditBike" label="Editar" color="green" icon="i-heroicons-check" :disabled="isLoading" @click="editBike" />
            <UButton v-else label="Confirmar" color="green" icon="i-heroicons-check" :disabled="isLoading" @click="insertBike" />
            <UButton label="Cancelar" color="red" icon="i-heroicons-no-symbol" :disabled="isLoading" @click="modalInsertBike = false" />
          </div>
        </template>
      </UCard>
    </UModal>

    <UModal v-model="modalDeleteBike" prevent-close :ui="{ width: '!w-3/5 !max-w-none' }">
      <UCard>
        <template #header>
          <h2 class="pt-3 text-center text-xl font-semibold leading-tight text-gray-900 dark:text-white">
            Deletar Bicicleta
          </h2>
        </template>

        <p class="text-center text-lg font-semibold">
          Tem certeza que deseja excluir a bicicleta?
        </p>

        <template #footer>
          <div class="flex justify-center space-x-4">
            <UButton label="Confirmar" color="green" icon="i-heroicons-check" :disabled="isLoading" @click="deleteBike" />
            <UButton label="Cancelar" color="red" icon="i-heroicons-no-symbol" :disabled="isLoading" @click="modalDeleteBike = false" />
          </div>
        </template>
      </UCard>
    </UModal>

    <UModal v-model="modalDeleteUser" prevent-close :ui="{ width: '!w-3/5 !max-w-none' }">
      <UCard>
        <template #header>
          <h2 class="pt-3 text-center text-xl font-semibold leading-tight text-gray-900 dark:text-white">
            Deletar Usuário
          </h2>
        </template>

        <p class="text-center text-lg font-semibold">
          Tem certeza que deseja excluir o usuário?
        </p>

        <template #footer>
          <div class="flex justify-center space-x-4">
            <UButton label="Confirmar" color="green" icon="i-heroicons-check" :disabled="isLoading" @click="deleteUser" />
            <UButton label="Cancelar" color="red" icon="i-heroicons-no-symbol" :disabled="isLoading" @click="modalDeleteUser = false" />
          </div>
        </template>
      </UCard>
    </UModal>
  </section>
</template>

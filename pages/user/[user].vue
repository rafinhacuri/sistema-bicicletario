<script setup lang="ts">
import type { UserEdit } from '~/schemas/user'
import { UserEditSchema, UserFotoSchema } from '~/schemas/user'

definePageMeta({ pageTransition: { name: 'slide-right', mode: 'out-in' } })

const { user } = useRoute().params

const { data, refresh } = await useFetch('/api/fetch/user', { method: 'post', body: { user } })
const { data: dataAluguel } = await useFetch('/api/fetch/alugueis', { method: 'post', body: { user } })

if(!data.value) throw createError({ statusCode: 404, statusMessage: 'Não encontrado', message: 'Este usuário não existe' })

const toast = useToast()

const { start, finish, isLoading } = useLoadingIndicator()

const items = [
  { key: 'dados', label: 'Dados do Perfil', description: 'Dados do Perfil' },
  { key: 'historico', label: 'Histórico de Aluguel', description: 'Histórico de Aluguel' },
]

const colunas = computed(() => [
  { key: 'codigo', label: 'Codigo', sortable: true },
  { key: 'dataInicio', label: 'Data Início', sortable: true },
  { key: 'dataFim', label: 'Data Fim', sortable: true },
  { key: 'valor', label: 'Valor do Aluguel', sortable: true },
  { key: 'pago', label: 'Concluído', sortable: true },
].filter(col => col !== undefined))

function formatarData(data: Date){
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const page = ref(1)

const pageCount = ref({ qnt: 10, txt: 'Mostrar 4 Itens' })

const pesquisar = ref('')

const filtro = computed(() => {
  if(pesquisar.value && dataAluguel.value){
    return dataAluguel.value.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(pesquisar.value.toLowerCase())))
  }
  return dataAluguel.value
})

const registro = computed(() => {
  if(filtro.value){
    return filtro.value.slice((page.value - 1) * pageCount.value.qnt, page.value * pageCount.value.qnt)
  }
  return filtro.value
})

const dados = ref(data.value.dadosBancarios)
const isEdit = ref(false)

const stateUser = ref<UserEdit>({ id: data.value._id, nome: data.value.nome, sobrenome: data.value.sobrenome, cpf: data.value.cpf, email: data.value.email, senhaAtual: '', senhaNova: '', confirmacaoSenha: '', dadosBancarios: data.value.dadosBancarios, numeroCartao: data.value.numeroCartao ? data.value.numeroCartao : '', dataValidade: data.value.dataValidade ? data.value.dataValidade : '', cvv: data.value.cvv ? data.value.cvv : '', nomeCartao: data.value.nomeCartao ? data.value.nomeCartao : '', cpfCartao: data.value.cpfCartao ? data.value.cpfCartao : '' })

function applyCardMask(event: Event){
  const input = event.target as HTMLInputElement
  input.value = input.value.replaceAll(/\D/g, '').replaceAll(/(\d{4})(?=\d)/g, '$1 ')
  stateUser.value.numeroCartao = input.value
}

function applyExpiryMask(event: Event){
  const input = event.target as HTMLInputElement
  input.value = input.value.replaceAll(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2')
  stateUser.value.dataValidade = input.value
}

async function editUser(){
  start()

  stateUser.value.dadosBancarios = dados.value

  const body = UserEditSchema.safeParse(stateUser.value)

  if(!body.success){
    toast.add({ title: body.error.errors[0].message, icon: 'i-heroicons-exclamation-triangle', color: 'red' })
    return finish({ error: true })
  }

  const res = await $fetch('/api/update/user', { method: 'post', body: body.data })
    .catch(error => { toast.add({ title: error.data.message, icon: 'i-heroicons-exclamation-triangle', color: 'red' }) })

  if(!res) return finish({ error: true })

  finish()
  await refresh()
  toast.add({ title: res, icon: 'i-heroicons-check-badge', color: 'green' })
  isEdit.value = false
  if(data.value && (body.data.email !== data.value.email)) navigateTo(`/user/${body.data.email}`)
}

watch(dados, nv => {
  if(!nv){
    stateUser.value.numeroCartao = ''
    stateUser.value.dataValidade = ''
    stateUser.value.cvv = ''
    stateUser.value.nomeCartao = ''
    stateUser.value.cpfCartao = ''
  }
})

watch(isEdit, nv => {
  if(!nv && data.value){
    dados.value = data.value.dadosBancarios
    stateUser.value.nome = data.value.nome
    stateUser.value.sobrenome = data.value.sobrenome
    stateUser.value.cpf = data.value.cpf
    stateUser.value.email = data.value.email
    stateUser.value.senhaAtual = ''
    stateUser.value.senhaNova = ''
    stateUser.value.confirmacaoSenha = ''
    stateUser.value.dadosBancarios = data.value.dadosBancarios
    stateUser.value.numeroCartao = data.value.numeroCartao ? data.value.numeroCartao : ''
    stateUser.value.dataValidade = data.value.dataValidade ? data.value.dataValidade : ''
    stateUser.value.cvv = data.value.cvv ? data.value.cvv : ''
    stateUser.value.nomeCartao = data.value.nomeCartao ? data.value.nomeCartao : ''
    stateUser.value.cpfCartao = data.value.cpfCartao ? data.value.cpfCartao : ''
  }
})

const modalFoto = ref(false)

const foto = ref<File | null>(null)

const { open, onChange } = useFileDialog({ accept: 'image/*', multiple: false })
onChange(file => {
  if(file !== null && file.length > 0){
    [foto.value] = file
    return { title: 'Imagem atualizada com sucesso', icon: 'i-heroicons-check-badge', color: 'green' }
  }
})

async function inserFoto(){
  start()

  const body = UserFotoSchema.safeParse({ id: data.value?._id, imagem: foto.value })

  if(!body.success){
    toast.add({ title: body.error.errors[0].message, icon: 'i-heroicons-exclamation-triangle', color: 'red' })
    return finish({ error: true })
  }

  const formData = new FormData()
  formData.append('imagem', foto.value || '')
  formData.append('id', body.data.id)

  const res = await $fetch('/api/update/foto', { method: 'post', body: formData })
    .catch(error => { toast.add({ title: error.data.message, icon: 'i-heroicons-exclamation-triangle', color: 'red' }) })

  if(!res) return finish({ error: true })

  finish()
  await refresh()
  toast.add({ title: res, icon: 'i-heroicons-check-badge', color: 'green' })
  modalFoto.value = false
}

watch(modalFoto, nv => {
  if(!nv) foto.value = null
})
</script>

<template>
  <section>
    <UTabs :items="items" class="mx-8 mt-8">
      <template #item="{ item }">
        <div v-if="item.key === 'dados'">
          <div class="mt-6 flex justify-center">
            <div class="relative flex" :class="{ 'group cursor-pointer': isEdit }" role="button" @click="isEdit ? modalFoto = true : modalFoto = false" @keydown.enter="isEdit ? modalFoto = true : modalFoto = false">
              <img v-if="data && data.foto" class="size-36 rounded-full" :src="`/imagem/${data.foto}`" :alt="data.nome">
              <img v-else class="size-36 rounded-full" src="/icone.jpg" alt="Usuário sem foto">
              <div class="invisible absolute flex size-36 items-center justify-center rounded-full bg-slate-950 opacity-70 group-hover:visible">
                <UIcon name="i-heroicons-camera" class="text-xl text-white" />
              </div>
            </div>
          </div>

          <p>{{ foto }}</p>

          <div class="m-6">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white" for="nome">Nome</label>
                <UInput id="Nome" v-model="stateUser.nome" icon="i-heroicons-user" :disabled="!isEdit" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white" for="sobrenome">Sobrenome</label>
                <UInput id="Sobrenome" v-model="stateUser.sobrenome" icon="i-heroicons-user" :disabled="!isEdit" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white" for="cpf">CPF</label>
                <UInput id="CPF" v-model="stateUser.cpf" icon="i-heroicons-document" :disabled="!isEdit" maxlength="11" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white" for="email">Email</label>
                <UInput id="Email" v-model="stateUser.email" icon="i-heroicons-envelope" :disabled="!isEdit" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white" for="senha">Senha Atual</label>
                <UInput id="Senha" v-model="stateUser.senhaAtual" icon="i-heroicons-key" type="password" :disabled="!isEdit" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white" for="senha">Nova Senha</label>
                <UInput id="Senha" v-model="stateUser.senhaNova" icon="i-heroicons-key" type="password" :disabled="!isEdit" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white" for="confirmarSenha">Confirmar Senha</label>
                <UInput id="ConfirmarSenha" v-model="stateUser.confirmacaoSenha" icon="i-heroicons-check" type="password" :disabled="!isEdit" />
              </div>
            </div>

            <UDivider label="Dados de Pagamento" class="my-10" />

            <div class=" flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-900 dark:text-white" for="1-parcela">Deseja Inserir Dados Bancarios?</label>
              <UToggle id="1-parcela" v-model="dados" on-icon="i-heroicons-check-20-solid" off-icon="i-heroicons-x-mark-20-solid" :disabled="!isEdit" />
            </div>

            <div v-if="dados" class="mt-5 grid grid-cols-3 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white" for="numero-cartao">Numero do cartão</label>
                <UInput id="numero-cartao" v-model="stateUser.numeroCartao" icon="i-heroicons-credit-card" maxlength="19" :disabled="!isEdit" @input="applyCardMask" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white" for="validade-cartao">Validade do cartão</label>
                <UInput id="validade-cartao" v-model="stateUser.dataValidade" icon="i-heroicons-calendar" maxlength="4" :disabled="!isEdit" @input="applyExpiryMask" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white" for="cvv">CVV</label>
                <UInput id="cvv" v-model="stateUser.cvv" icon="i-heroicons-lock-closed" maxlength="3" :disabled="!isEdit" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white" for="nome-cartao">Nome do cartão</label>
                <UInput id="nome-cartao" v-model="stateUser.nomeCartao" icon="i-heroicons-user" :disabled="!isEdit" />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white" for="cpf-cartao">CPF do cartão</label>
                <UInput id="cpf-cartao" v-model="stateUser.cpfCartao" icon="i-heroicons-document" maxlength="11" :disabled="!isEdit" />
              </div>
            </div>
          </div>
          <div class="my-10 flex items-center justify-center space-x-4">
            <UButton v-if="!isEdit" :ui="{ rounded: 'rounded-full' }" variant="outline" color="amber" class="flex items-center justify-center" @click="isEdit = true">
              Permitir Edição
            </UButton>
            <UButton v-if="isEdit" :ui="{ rounded: 'rounded-full' }" variant="outline" color="red" class="flex items-center justify-center" @click="isEdit = false">
              Cancelar Edição
            </UButton>
            <UButton v-if="isEdit" :ui="{ rounded: 'rounded-full' }" variant="outline" color="green" class="flex items-center justify-center" :disabled="isLoading" :loading="isLoading" @click="editUser">
              Confirmar Edição
            </UButton>
          </div>
        </div>

        <div v-else-if="item.key === 'historico'">
          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <UInput id="pesquisar-pessoas" v-model="pesquisar" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Pesquisar Usuário" />
          </div>
          <UTable v-if="registro" :rows="registro" :columns="colunas" :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Carregando...' }" :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Nenhum Usuário encontrado.', }" sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down">
            <template #dataInicio-data="{ row }">
              <UBadge size="xs" :label="formatarData(row.dataInicio)" variant="outline" color="fuchsia" />
            </template>
            <template #dataFim-data="{ row }">
              <UBadge size="xs" :label="formatarData(row.dataFim)" variant="outline" color="fuchsia" />
            </template>

            <template #pago-data="{ row }">
              <div class="flex space-x-2">
                {{ row.pago ? 'Sim' : 'Não' }}
              </div>
            </template>
          </UTable>
          <UPagination v-if="filtro" v-model="page" class="flex justify-end" :page-count="pageCount.qnt" :total="filtro.length" />
        </div>
      </template>
    </UTabs>

    <UModal v-model="modalFoto" prevent-close :ui="{ width: '!w-1/5 !max-w-none' }">
      <UCard>
        <template #header>
          <h2 class="pt-3 text-center text-xl font-semibold leading-tight text-gray-900 dark:text-white">
            Editar Foto de Perfil
          </h2>
        </template>

        <div>
          <label class="text-sm font-medium text-gray-900 dark:text-white" for="image-perfil">Foto de Perfil</label>
          <UButton class="w-full" :color="foto? 'green' : 'blue'" :label="foto? 'Selecionado' : 'Selecione'" :icon="foto ? 'i-heroicons-check-circle' : 'i-heroicons-arrow-up-tray'" @click="open()" />
        </div>

        <template #footer>
          <div class="flex justify-center space-x-4">
            <UButton label="Confirmar" color="green" icon="i-heroicons-check" :disabled="isLoading" @click="inserFoto" />
            <UButton label="Cancelar" color="red" icon="i-heroicons-no-symbol" :disabled="isLoading" @click="modalFoto = false" />
          </div>
        </template>
      </UCard>
    </UModal>
  </section>
</template>

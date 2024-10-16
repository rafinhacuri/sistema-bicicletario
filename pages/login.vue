<script setup lang="ts">
import type { Authentication, User } from '~/schemas/authentication'
import { AuthenticationSchema, UserSchema } from '~/schemas/authentication'

useHead({ title: `Login` })

defineOgImageComponent('NuxtSeo', { theme: '#3FA1B0', colorMode: 'dark' })

const toast = useToast()

const { start, finish, isLoading } = useLoadingIndicator()

const state = ref<Authentication>({ email: '', senha: '' })

async function login(){
  start()

  const body = AuthenticationSchema.safeParse(state.value)
  if(!body.success){
    toast.add({ title: body.error.errors[0].message, icon: 'i-heroicons-exclamation-triangle', color: 'red' })
    return finish()
  }

  const res = await $fetch('/auth', { method: 'post', body: body.data })
    .catch(error => { toast.add({ title: error.data.message, icon: 'i-heroicons-exclamation-triangle', color: 'red' }) })

  finish({ force: true })

  if(!res) return

  toast.add({ title: res, icon: 'i-heroicons-check-badge', color: 'green' })
  await navigateTo('/')
}

const modalInscrevasse = ref(false)
const dados = ref(false)

const stateUser = ref<User>({ nome: '', sobrenome: '', cpf: '', email: '', senha: '', confirmacaoSenha: '', dadosBancarios: false, numeroCartao: '', dataValidade: '', cvv: '', nomeCartao: '', cpfCartao: '',
})

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

watch(dados, nv => {
  if(!nv){
    stateUser.value.numeroCartao = ''
    stateUser.value.dataValidade = ''
    stateUser.value.cvv = ''
    stateUser.value.nomeCartao = ''
    stateUser.value.cpfCartao = ''
  }
})

async function insertUser(){
  start()

  stateUser.value.dadosBancarios = dados.value

  const body = UserSchema.safeParse(stateUser.value)

  if(!body.success){
    toast.add({ title: body.error.errors[0].message, icon: 'i-heroicons-exclamation-triangle', color: 'red' })
    return finish({ error: true })
  }

  const res = await $fetch('/api/insert/user', { method: 'post', body: body.data })
    .catch(error => { toast.add({ title: error.data.message, icon: 'i-heroicons-exclamation-triangle', color: 'red' }) })

  if(!res) return finish({ error: true })

  finish()
  toast.add({ title: res, icon: 'i-heroicons-check-badge', color: 'green' })
  modalInscrevasse.value = false
}

watch(modalInscrevasse, nv => {
  if(!nv){
    stateUser.value.nome = ''
    stateUser.value.sobrenome = ''
    stateUser.value.cpf = ''
    stateUser.value.email = ''
    stateUser.value.senha = ''
    stateUser.value.confirmacaoSenha = ''
    stateUser.value.dadosBancarios = false
    stateUser.value.numeroCartao = ''
    stateUser.value.dataValidade = ''
    stateUser.value.cvv = ''
    stateUser.value.nomeCartao = ''
    stateUser.value.cpfCartao = ''
  }
})
</script>

<template>
  <section class="min-h-[calc(100vh-131px)] bg-[url('/fundo-claro.webp')] bg-cover bg-center bg-no-repeat dark:bg-[url('/fundo-escuro.webp')]">
    <div class="mx-auto flex min-h-[calc(100vh-131px)] flex-col items-center justify-center px-6">
      <div class="w-full rounded-lg  bg-white shadow sm:max-w-md md:mt-0 xl:p-0 dark:border dark:border-gray-700 dark:bg-gray-800">
        <div class="space-y-4 p-6 sm:p-8 md:space-y-6">
          <h1 class="ms-2 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Login
          </h1>
          <UForm :schema="AuthenticationSchema" :state class="space-y-4 md:space-y-6" @submit="login">
            <UFormGroup label="Email" name="email">
              <UInput v-model="state.email" icon="i-heroicons-user" size="lg" color="white" />
            </UFormGroup>
            <UFormGroup label="Senha" name="senha">
              <UInput v-model="state.senha" icon="i-heroicons-key" size="lg" color="white" type="password" />
            </UFormGroup>
            <div class="!-mt-px text-end">
              <UButton :ui="{ rounded: 'rounded-full' }" variant="ghost" @click="modalInscrevasse = true">
                Crie sua conta...
              </UButton>
            </div>

            <UButton icon="i-heroicons-arrow-left-on-rectangle" label="Entrar" variant="solid" block type="submit" :loading="isLoading" />
          </UForm>
        </div>
      </div>
    </div>

    <UModal v-model="modalInscrevasse" prevent-close :ui="{ width: '!w-3/5 !max-w-none' }">
      <UCard>
        <template #header>
          <h2 class="pt-3 text-center text-xl font-semibold leading-tight text-gray-900 dark:text-white">
            crie sua conta
          </h2>
        </template>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="nome">Nome</label>
            <UInput id="Nome" v-model="stateUser.nome" icon="i-heroicons-user" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="sobrenome">Sobrenome</label>
            <UInput id="Sobrenome" v-model="stateUser.sobrenome" icon="i-heroicons-user" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="cpf">CPF</label>
            <UInput id="CPF" v-model="stateUser.cpf" icon="i-heroicons-document" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="email">Email</label>
            <UInput id="Email" v-model="stateUser.email" icon="i-heroicons-envelope" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="senha">Senha</label>
            <UInput id="Senha" v-model="stateUser.senha" icon="i-heroicons-key" type="password" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="confirmarSenha">Confirmar Senha</label>
            <UInput id="ConfirmarSenha" v-model="stateUser.confirmacaoSenha" icon="i-heroicons-check" type="password" />
          </div>
        </div>

        <UDivider label="Dados de Pagamento" class="my-10" />

        <div class=" flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-900 dark:text-white" for="1-parcela">Deseja Inserir Dados Bancarios?</label>
          <UToggle id="1-parcela" v-model="dados" on-icon="i-heroicons-check-20-solid" off-icon="i-heroicons-x-mark-20-solid" />
        </div>

        <div v-if="dados" class="mt-5 grid grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="numero-cartao">Numero do cartão</label>
            <UInput id="numero-cartao" v-model="stateUser.numeroCartao" icon="i-heroicons-credit-card" maxlength="19" @input="applyCardMask" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="validade-cartao">Validade do cartão</label>
            <UInput id="validade-cartao" v-model="stateUser.dataValidade" icon="i-heroicons-calendar" maxlength="4" @input="applyExpiryMask" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="cvv">CVV</label>
            <UInput id="cvv" v-model="stateUser.cvv" icon="i-heroicons-lock-closed" maxlength="3" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="nome-cartao">Nome do cartão</label>
            <UInput id="nome-cartao" v-model="stateUser.nomeCartao" icon="i-heroicons-user" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="cpf-cartao">CPF do cartão</label>
            <UInput id="cpf-cartao" v-model="stateUser.cpfCartao" icon="i-heroicons-document" maxlength="11" />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-center space-x-4">
            <UButton label="Confirmar" color="green" icon="i-heroicons-check" :disabled="isLoading" @click="insertUser" />
            <UButton label="Cancelar" color="red" icon="i-heroicons-no-symbol" :disabled="isLoading" @click="modalInscrevasse = false" />
          </div>
        </template>
      </UCard>
    </UModal>
  </section>
</template>

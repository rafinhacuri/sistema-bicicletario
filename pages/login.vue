<script setup lang="ts">
import type { Authentication } from '~/schemas/authentication'
import type { User } from '~/schemas/user'
import { AuthenticationSchema } from '~/schemas/authentication'
import { UserSchema } from '~/schemas/user'

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

const stateUser = ref<User>({ email: '', senha: '', confirmacaoSenha: '', nome: '' })

async function insertUser(){
  start()

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
    stateUser.value.email = ''
    stateUser.value.senha = ''
    stateUser.value.confirmacaoSenha = ''
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

    <UModal v-model="modalInscrevasse" prevent-close :ui="{ width: '!w-1/5 !max-w-none' }">
      <UCard>
        <template #header>
          <h2 class="pt-3 text-center text-xl font-semibold leading-tight text-gray-900 dark:text-white">
            crie sua conta
          </h2>
        </template>

        <div>
          <div>
            <label class="text-sm font-medium text-gray-900 dark:text-white" for="nome">nome</label>
            <UInput id="nome" v-model="stateUser.nome" icon="i-heroicons-user" />
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

<script setup lang="ts">
const error = useError()

const statusCode = ref(500)
const message = ref('Algo deu errado...')

if(error.value && 'statusCode' in error.value && 'message' in error.value){
  statusCode.value = error.value.statusCode
  message.value = error.value.message
}

useHead({ title: `${statusCode.value}` })
</script>

<template>
  <section class="mx-auto flex min-h-screen flex-col items-center justify-center bg-[url('/fundo.jpg')] bg-cover bg-center bg-no-repeat px-6">
    <div class="w-full rounded-lg bg-white shadow sm:max-w-md md:mt-0 xl:p-0 dark:border dark:border-gray-700 dark:bg-gray-800">
      <div class="space-y-4 p-6 text-center sm:p-8 md:space-y-6">
        <h1 class="text-xl font-bold leading-tight tracking-tight text-red-500 md:text-2xl">
          {{ statusCode }}
        </h1>
        <p class="text-base font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          {{ message }}
        </p>
        <UButton icon="i-heroicons-home" label="Voltar ao início" @click="clearError({ redirect: '/' })" />
      </div>
    </div>
  </section>
</template>

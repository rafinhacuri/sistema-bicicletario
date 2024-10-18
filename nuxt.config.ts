import process from 'node:process'

const { PRODUCTION, SITE_URL, MONGO_URL, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DB_NAME, DEV_URL, DEV_KEY, DEV_CERT } = process.env
export default defineNuxtConfig({

  modules: ['@nuxt/ui', '@vueuse/nuxt', 'nuxt-auth-utils', '@nuxt/scripts', '@nuxtjs/seo', 'nuxt-security'],
  app: {
    head: { templateParams: { separator: '•' } },
    pageTransition: { name: 'slide-left', mode: 'out-in' },
  },
  css: ['~/assets/global.css', 'v-calendar/style.css'],
  colorMode: { fallback: 'dark', preference: 'dark' },
  site: {
    url: SITE_URL,
    name: 'Bicicletario',
    description: 'O sistema biciletario',
    identity: { type: 'Organization' },
  },
  robots: { disallow: ['/user/', '/adm'] },
  security: {
    headers: {
      crossOriginEmbedderPolicy: PRODUCTION === 'true' ? 'require-corp' : 'unsafe-none',
      permissionsPolicy: { camera: '*' },
    },
    requestSizeLimiter: { maxRequestSizeInBytes: 100000000, maxUploadFileRequestInBytes: 100000000 },
    rateLimiter: { tokensPerInterval: 100, interval: 10000 },
    xssValidator: false,
  },
  runtimeConfig: {
    MONGO_URL,
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_DB_NAME,
    session: { maxAge: 8 * 60 * 60 },
    public: { PRODUCTION, SITE_URL },
  },

  linkChecker: { enabled: false },
  nitro: {
    experimental: { asyncContext: true },
  },
  devServer: {
    host: DEV_URL,
    https: { key: DEV_KEY, cert: DEV_CERT },
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-07-11',
})

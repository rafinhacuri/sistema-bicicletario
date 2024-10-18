export default defineEventHandler(async () => {
  const usuario = await Bikes.find().lean()
    .catch(() => { throw createError({ status: 404, message: 'Auditório não existe' }) })

  return usuario
})

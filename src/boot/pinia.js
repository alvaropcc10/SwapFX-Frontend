import { boot } from 'quasar/wrappers'
import pinia from '@/stores/index.js'

export default boot(({ app }) => {
  app.use(pinia)
})

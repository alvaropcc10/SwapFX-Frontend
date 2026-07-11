<template>
  <div class="flex flex-center" style="min-height: 100vh; background: #f0f2f5">
    <q-card flat bordered style="width: 380px" class="q-pa-md">
      <q-card-section class="text-center q-pb-none">
        <div class="text-h5 text-blue-9 text-weight-bold">SwapFX</div>
        <div class="text-caption text-grey q-mt-xs">Plataforma P2P de intercambio de divisas</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleLogin" class="column q-gutter-sm">
          <q-input
            v-model="form.email"
            label="Correo electronico"
            type="email"
            outlined
            dense
            :rules="[v => !!v || 'Campo requerido']"
          />
          <q-input
            v-model="form.password"
            label="Contrasena"
            type="password"
            outlined
            dense
            :rules="[v => !!v || 'Campo requerido']"
          />
          <div v-if="error" class="text-negative text-caption">{{ error }}</div>
          <q-btn
            type="submit"
            label="Ingresar"
            color="blue-9"
            unelevated
            class="q-mt-sm"
            :loading="cargando"
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <span class="text-caption text-grey">No tienes cuenta? </span>
        <router-link to="/register" class="text-blue-9 text-caption">Registrate</router-link>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const cargando = ref(false)
const error = ref('')
const form = reactive({ email: '', password: '' })

async function handleLogin() {
  error.value = ''
  cargando.value = true
  try {
    await authStore.login(form.email, form.password)
    $q.notify({ type: 'positive', message: 'Bienvenido a SwapFX' })
    router.push('/')
  } catch (e) {
    console.error('error login:', e)
    error.value = 'Credenciales incorrectas. Verifica tu correo y contrasena.'
  } finally {
    cargando.value = false
  }
}
</script>

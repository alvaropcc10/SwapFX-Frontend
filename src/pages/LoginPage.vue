<template>
  <div style="min-height:100vh; background: linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)" class="flex flex-center">
    <div class="row" style="max-width:900px; width:100%">

      <!-- lado izquierdo info -->
      <div class="col-12 col-md-6 flex flex-center q-pa-xl text-white">
        <div class="text-center">
          <q-icon name="swap_horiz" size="80px" color="amber" />
          <div class="text-h3 text-weight-bold q-mt-md" style="letter-spacing:2px">SwapFX</div>
          <q-badge color="amber" text-color="dark" label="Plataforma P2P" class="q-mt-sm" />
          <div class="text-h6 q-mt-lg text-blue-2">Intercambia divisas</div>
          <div class="text-h6 text-blue-2">de forma segura</div>
          <div class="q-mt-xl row q-gutter-md justify-center">
            <div class="text-center">
              <q-icon name="security" size="32px" color="amber" />
              <div class="text-caption q-mt-xs">Seguro</div>
            </div>
            <div class="text-center">
              <q-icon name="speed" size="32px" color="amber" />
              <div class="text-caption q-mt-xs">Rapido</div>
            </div>
            <div class="text-center">
              <q-icon name="people" size="32px" color="amber" />
              <div class="text-caption q-mt-xs">P2P</div>
            </div>
          </div>
        </div>
      </div>

      <!-- lado derecho formulario -->
      <div class="col-12 col-md-6 flex flex-center q-pa-md">
        <q-card flat style="width:100%; max-width:380px; border-radius:16px" class="q-pa-lg">
          <q-card-section class="text-center q-pb-none">
            <div class="text-h5 text-primary text-weight-bold">Bienvenido</div>
            <div class="text-caption text-grey q-mt-xs">Inicia sesion para continuar</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="handleLogin" class="column q-gutter-md">
              <q-input
                v-model="form.email"
                label="Correo electronico"
                type="email"
                outlined
                dense
                :rules="[v => !!v || 'Campo requerido']"
              >
                <template #prepend><q-icon name="email" color="primary" /></template>
              </q-input>
              <q-input
                v-model="form.password"
                label="Contrasena"
                :type="mostrarPassword ? 'text' : 'password'"
                outlined
                dense
                :rules="[v => !!v || 'Campo requerido']"
              >
                <template #prepend><q-icon name="lock" color="primary" /></template>
                <template #append>
                  <q-icon
                    :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="mostrarPassword = !mostrarPassword"
                  />
                </template>
              </q-input>
              <div v-if="error" class="text-negative text-caption text-center">{{ error }}</div>
              <q-btn
                type="submit"
                label="Ingresar"
                unelevated
                class="q-mt-sm full-width"
                style="background: linear-gradient(135deg, #1565C0, #1E88E5); color:white; border-radius:8px; height:44px"
                :loading="cargando"
              />
            </q-form>
          </q-card-section>

          <q-card-section class="text-center q-pt-none">
            <span class="text-caption text-grey">No tienes cuenta? </span>
            <router-link to="/register" class="text-primary text-caption text-weight-bold">Registrate aqui</router-link>
          </q-card-section>
        </q-card>
      </div>
    </div>
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
const mostrarPassword = ref(false)
const form = reactive({ email: '', password: '' })

async function handleLogin() {
  error.value = ''
  cargando.value = true
  try {
    await authStore.login(form.email, form.password)
    $q.notify({ type: 'positive', message: 'Bienvenido a SwapFX' })
    router.push('/')
  } catch {
    error.value = 'Credenciales incorrectas. Verifica tu correo y contrasena.'
  } finally {
    cargando.value = false
  }
}
</script>

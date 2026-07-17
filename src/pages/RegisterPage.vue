<template>
  <div style="min-height:100vh; background: linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)" class="flex flex-center q-pa-md">
    <q-card flat style="width:100%; max-width:460px; border-radius:16px" class="q-pa-lg">
      <q-card-section class="text-center q-pb-none">
        <q-icon name="swap_horiz" size="40px" color="primary" />
        <div class="text-h5 text-primary text-weight-bold q-mt-sm">Crear cuenta</div>
        <div class="text-caption text-grey q-mt-xs">Unete a SwapFX y empieza a intercambiar</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleRegistro" class="column q-gutter-sm">
          <div class="row q-gutter-sm">
            <q-input v-model="form.nombres" label="Nombres" outlined dense class="col" :rules="[v => !!v || 'Requerido']">
              <template #prepend><q-icon name="person" color="primary" /></template>
            </q-input>
            <q-input v-model="form.apellidos" label="Apellidos" outlined dense class="col" :rules="[v => !!v || 'Requerido']" />
          </div>
          <div class="row q-gutter-sm">
            <q-input v-model="form.dni" label="DNI" outlined dense class="col" maxlength="8" />
            <q-input v-model="form.telefono" label="Telefono" outlined dense class="col" />
          </div>
          <q-input v-model="form.email" label="Correo electronico" type="email" outlined dense :rules="[v => !!v || 'Requerido']">
            <template #prepend><q-icon name="email" color="primary" /></template>
          </q-input>
          <q-input v-model="form.password" label="Contrasena" :type="mostrarPassword ? 'text' : 'password'" outlined dense :rules="[v => !!v || 'Requerido', v => v.length >= 8 || 'Minimo 8 caracteres']">
            <template #prepend><q-icon name="lock" color="primary" /></template>
            <template #append>
              <q-icon :name="mostrarPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="mostrarPassword = !mostrarPassword" />
            </template>
          </q-input>
          <div v-if="error" class="text-negative text-caption text-center">{{ error }}</div>
          <q-btn
            type="submit"
            label="Registrarme"
            unelevated
            class="q-mt-sm full-width"
            style="background: linear-gradient(135deg, #1565C0, #1E88E5); color:white; border-radius:8px; height:44px"
            :loading="cargando"
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <span class="text-caption text-grey">Ya tienes cuenta? </span>
        <router-link to="/login" class="text-primary text-caption text-weight-bold">Inicia sesion aqui</router-link>
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
const mostrarPassword = ref(false)
const form = reactive({ nombres: '', apellidos: '', dni: '', telefono: '', email: '', password: '' })

async function handleRegistro() {
  error.value = ''
  cargando.value = true
  try {
    await authStore.registro(form)
    $q.notify({ type: 'positive', message: 'Cuenta creada. Ahora puedes iniciar sesion.' })
    router.push('/login')
  } catch (e) {
    error.value = e.response?.data || 'Error al registrar. Intenta de nuevo.'
  } finally {
    cargando.value = false
  }
}
</script>

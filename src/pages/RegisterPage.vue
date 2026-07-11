<template>
  <div class="flex flex-center" style="min-height: 100vh; background: #f0f2f5">
    <q-card flat bordered style="width: 420px" class="q-pa-md">
      <q-card-section class="text-center q-pb-none">
        <div class="text-h5 text-blue-9 text-weight-bold">SwapFX</div>
        <div class="text-caption text-grey q-mt-xs">Crear nueva cuenta</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleRegistro" class="column q-gutter-sm">
          <div class="row q-gutter-sm">
            <q-input v-model="form.nombres" label="Nombres" outlined dense class="col" :rules="[v => !!v || 'Requerido']" />
            <q-input v-model="form.apellidos" label="Apellidos" outlined dense class="col" :rules="[v => !!v || 'Requerido']" />
          </div>
          <q-input v-model="form.dni" label="DNI" outlined dense maxlength="8" />
          <q-input v-model="form.telefono" label="Telefono" outlined dense />
          <q-input v-model="form.email" label="Correo electronico" type="email" outlined dense :rules="[v => !!v || 'Requerido']" />
          <q-input v-model="form.password" label="Contrasena" type="password" outlined dense :rules="[v => !!v || 'Requerido', v => v.length >= 8 || 'Minimo 8 caracteres']" />
          <div v-if="error" class="text-negative text-caption">{{ error }}</div>
          <q-btn type="submit" label="Registrarme" color="blue-9" unelevated class="q-mt-sm" :loading="cargando" />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <span class="text-caption text-grey">Ya tienes cuenta? </span>
        <router-link to="/login" class="text-blue-9 text-caption">Inicia sesion</router-link>
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

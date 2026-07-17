<template>
  <q-page class="q-pa-md">
    <div class="q-mb-lg">
      <div class="text-h5 text-weight-bold text-dark">Mi perfil</div>
      <div class="text-caption text-grey-6">Gestiona tu informacion personal y cuentas bancarias</div>
    </div>

    <div class="row q-gutter-md">
      <!-- datos personales -->
      <div class="col-12 col-md-5">
        <q-card flat bordered style="border-radius:12px; border:1px solid #E3F2FD">
          <q-card-section>
            <div class="text-subtitle1 text-blue-9 text-weight-bold q-mb-sm">Datos personales</div>
            <div class="column q-gutter-xs">
              <div class="row">
                <div class="col-4 text-caption text-grey">Nombres</div>
                <div class="col text-body2">{{ authStore.usuario?.nombres }}</div>
              </div>
              <div class="row">
                <div class="col-4 text-caption text-grey">Apellidos</div>
                <div class="col text-body2">{{ authStore.usuario?.apellidos }}</div>
              </div>
              <div class="row">
                <div class="col-4 text-caption text-grey">Email</div>
                <div class="col text-body2">{{ authStore.usuario?.email }}</div>
              </div>
              <div class="row">
                <div class="col-4 text-caption text-grey">Rol</div>
                <div class="col">
                  <q-chip
                    :color="authStore.esAdmin ? 'orange' : 'blue-9'"
                    text-color="white"
                    dense size="sm"
                  >
                    {{ authStore.esAdmin ? 'Administrador' : 'Usuario' }}
                  </q-chip>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- validacion de identidad -->
        <q-card flat bordered class="q-mt-md" style="border-radius:12px; border:1px solid #E3F2FD">
          <q-card-section>
            <div class="text-subtitle1 text-blue-9 text-weight-bold q-mb-sm">Validacion de identidad</div>
            <div class="row items-center q-gutter-sm">
              <q-chip v-if="authStore.usuario?.identidadValidada" color="green" text-color="white" dense size="sm" icon="verified">
                VERIFICADO
              </q-chip>
              <q-chip v-else color="grey" text-color="white" dense size="sm">
                Sin verificar
              </q-chip>
              <q-btn
                v-if="!authStore.usuario?.identidadValidada"
                flat dense
                color="blue-9"
                label="Solicitar verificacion"
                @click="verValidarIdentidad = true"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- cuentas bancarias -->
      <div class="col">
        <q-card flat bordered style="border-radius:12px; border:1px solid #E3F2FD">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle1 text-blue-9 text-weight-bold">Cuentas bancarias</div>
              <q-btn color="blue-9" dense unelevated icon="add" label="Agregar" @click="verAgregar = true" />
            </div>

            <div v-if="cargando" class="text-center q-pa-md">
              <q-spinner color="blue-9" />
            </div>

            <div v-else-if="cuentas.length === 0" class="text-grey text-caption q-pa-md text-center">
              No tienes cuentas bancarias registradas.
            </div>

            <q-list v-else separator>
              <q-item v-for="c in cuentas" :key="c.id">
                <q-item-section avatar>
                  <q-icon name="account_balance" color="blue-9" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ c.banco }} — {{ c.moneda }}</q-item-label>
                  <q-item-label caption>{{ c.titular }} · {{ c.tipoCuenta }} · {{ c.numeroCuenta }}</q-item-label>
                  <q-item-label caption v-if="c.cci">CCI: {{ c.cci }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip v-if="c.esPrincipal" color="green" text-color="white" dense size="sm">Principal</q-chip>
                  <q-btn flat round dense icon="delete" color="negative" @click="eliminarCuenta(c.id)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- dialog agregar cuenta -->
    <q-dialog v-model="verAgregar" persistent>
      <q-card style="min-width: 400px">
        <q-bar class="bg-blue-9 text-white">
          <q-icon name="account_balance" />
          <div class="q-ml-sm">Agregar cuenta bancaria</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <q-form @submit.prevent="agregarCuenta" class="column q-gutter-sm">
            <q-input v-model="nuevaCuenta.banco" label="Banco" outlined dense :rules="[v => !!v || 'Requerido']" />
            <q-input v-model="nuevaCuenta.titular" label="Titular" outlined dense :rules="[v => !!v || 'Requerido']" />
            <q-select
              v-model="nuevaCuenta.tipoCuenta"
              :options="['Cuenta corriente', 'Cuenta de ahorros']"
              label="Tipo de cuenta"
              outlined dense
              :rules="[v => !!v || 'Requerido']"
            />
            <q-input v-model="nuevaCuenta.numeroCuenta" label="Numero de cuenta" outlined dense :rules="[v => !!v || 'Requerido']" />
            <q-input v-model="nuevaCuenta.cci" label="CCI (opcional)" outlined dense />
            <q-select
              v-model="nuevaCuenta.moneda"
              :options="['PEN', 'USD', 'EUR']"
              label="Moneda"
              outlined dense
              :rules="[v => !!v || 'Requerido']"
            />
            <q-toggle v-model="nuevaCuenta.esPrincipal" label="Marcar como cuenta principal" />
            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn type="submit" color="blue-9" label="Guardar" unelevated :loading="guardando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- dialog solicitar verificacion de identidad -->
    <q-dialog v-model="verValidarIdentidad" persistent>
      <q-card style="min-width: 380px">
        <q-bar class="bg-blue-9 text-white">
          <q-icon name="verified" />
          <div class="q-ml-sm">Solicitar verificacion de identidad</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <q-form @submit.prevent="enviarDocumento" class="column q-gutter-sm">
            <q-file
              v-model="archivoDocumento"
              label="Documento (JPG, PNG o PDF)"
              outlined
              dense
              accept=".jpg,.jpeg,.png,.pdf"
              :rules="[v => !!v || 'Requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <q-select
              v-model="documento.tipoDoc"
              :options="['DNI', 'Pasaporte']"
              label="Tipo de documento"
              outlined dense
              :rules="[v => !!v || 'Requerido']"
            />
            <q-input v-model="documento.numeroDoc" label="Numero de documento" outlined dense :rules="[v => !!v || 'Requerido']" />
            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn type="submit" color="blue-9" label="Enviar" unelevated :loading="enviandoDocumento" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

const $q = useQuasar()
const authStore = useAuthStore()

const cuentas = ref([])
const cargando = ref(false)
const guardando = ref(false)
const verAgregar = ref(false)
const verValidarIdentidad = ref(false)
const enviandoDocumento = ref(false)
const archivoDocumento = ref(null)

const nuevaCuenta = reactive({
  banco: '', titular: '', tipoCuenta: '', numeroCuenta: '', cci: '', moneda: '', esPrincipal: false
})

const documento = reactive({ tipoDoc: '', numeroDoc: '' })

async function cargarCuentas() {
  cargando.value = true
  try {
    const res = await api.get('/api/cuentabancaria')
    cuentas.value = res.data.datos ?? res.data
  } catch (e) {
    console.error('error cuentas', e)
  } finally {
    cargando.value = false
  }
}

async function agregarCuenta() {
  guardando.value = true
  try {
    await api.post('/api/cuentabancaria', nuevaCuenta)
    verAgregar.value = false
    $q.notify({ type: 'positive', message: 'Cuenta bancaria registrada.' })
    cargarCuentas()
    Object.assign(nuevaCuenta, { banco: '', titular: '', tipoCuenta: '', numeroCuenta: '', cci: '', moneda: '', esPrincipal: false })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar la cuenta.' })
  } finally {
    guardando.value = false
  }
}

async function enviarDocumento() {
  enviandoDocumento.value = true
  try {
    await api.post('/api/documentoidentidad', {
      tipoDoc: documento.tipoDoc,
      numeroDoc: documento.numeroDoc,
      rutaArchivo: archivoDocumento.value?.name,
      estado: 'Pendiente',
    })
    verValidarIdentidad.value = false
    $q.notify({ type: 'positive', message: 'Documento enviado para revision.' })
    archivoDocumento.value = null
    documento.tipoDoc = ''
    documento.numeroDoc = ''
  } catch {
    $q.notify({ type: 'negative', message: 'Error al enviar el documento.' })
  } finally {
    enviandoDocumento.value = false
  }
}

async function eliminarCuenta(id) {
  try {
    await api.delete(`/api/cuentabancaria/${id}`)
    $q.notify({ type: 'positive', message: 'Cuenta eliminada.' })
    cargarCuentas()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar.' })
  }
}

onMounted(cargarCuentas)
</script>

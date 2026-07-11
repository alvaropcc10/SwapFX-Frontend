<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn flat round dense icon="arrow_back" color="blue-9" @click="$router.back()" />
      <div class="text-h5 text-blue-9 q-ml-sm">Detalle de transaccion</div>
    </div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="blue-9" size="3em" />
    </div>

    <div v-else-if="!tx" class="text-center text-grey q-pa-xl">
      Transaccion no encontrada.
    </div>

    <div v-else class="row q-gutter-md">
      <!-- resumen -->
      <div class="col-12 col-md-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-blue-9 text-weight-bold q-mb-sm">Resumen</div>
            <div class="row q-gutter-xs">
              <div class="col-5 text-caption text-grey">Codigo</div>
              <div class="col text-body2">{{ tx.codigo }}</div>
              <div class="col-5 text-caption text-grey">Estado</div>
              <div class="col">
                <q-chip :color="colorEstado(tx.estadoActual)" text-color="white" dense size="sm">{{ tx.estadoActual }}</q-chip>
              </div>
              <div class="col-5 text-caption text-grey">Par</div>
              <div class="col text-body2">{{ tx.monedaOrigen }} → {{ tx.monedaDestino }}</div>
              <div class="col-5 text-caption text-grey">Monto</div>
              <div class="col text-body2">{{ tx.montoOrigen }}</div>
              <div class="col-5 text-caption text-grey">Tipo cambio</div>
              <div class="col text-body2">{{ tx.tipoCambioAplicado }}</div>
              <div class="col-5 text-caption text-grey">Comprador</div>
              <div class="col text-body2">{{ tx.nombreComprador }}</div>
              <div class="col-5 text-caption text-grey">Vendedor</div>
              <div class="col text-body2">{{ tx.nombreVendedor }}</div>
              <div class="col-5 text-caption text-grey">Inicio</div>
              <div class="col text-body2">{{ formatFecha(tx.fechaInicio) }}</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- acciones -->
        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-subtitle1 text-blue-9 text-weight-bold q-mb-sm">Acciones</div>
            <div class="column q-gutter-sm">
              <q-btn
                v-if="puedeReportarComprobante"
                color="blue-9"
                label="Reportar comprobante de pago"
                icon="upload"
                unelevated
                @click="verComprobante = true"
              />
              <q-btn
                v-if="puedeConfirmarPago"
                color="teal"
                label="Confirmar recepcion de pago"
                icon="check_circle"
                unelevated
                :loading="confirmando"
                @click="confirmarPago"
              />
              <q-btn
                v-if="puedeCancelar"
                outline
                color="negative"
                label="Cancelar transaccion"
                icon="cancel"
                @click="verCancelar = true"
              />
              <q-btn
                v-if="puedeDisputar"
                outline
                color="orange"
                label="Reportar disputa"
                icon="warning"
                @click="verDisputa = true"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- comprobantes -->
      <div class="col">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-blue-9 text-weight-bold q-mb-sm">Comprobantes</div>
            <div v-if="tx.comprobantes.length === 0" class="text-grey text-caption">Sin comprobantes aun.</div>
            <q-list v-else separator>
              <q-item v-for="c in tx.comprobantes" :key="c.id">
                <q-item-section avatar><q-icon name="receipt" color="blue-9" /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ c.nombreArchivo }}</q-item-label>
                  <q-item-label caption>Op: {{ c.numeroOperacion }} · {{ formatFecha(c.fechaTransferencia) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- dialog comprobante -->
    <q-dialog v-model="verComprobante" persistent>
      <q-card style="min-width: 380px">
        <q-bar class="bg-blue-9 text-white">
          <q-icon name="upload" />
          <div class="q-ml-sm">Reportar comprobante</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <q-form @submit.prevent="enviarComprobante" class="column q-gutter-sm">
            <q-input v-model="comprobante.nombreArchivo" label="Nombre del archivo" outlined dense :rules="[v => !!v || 'Requerido']" />
            <q-input v-model="comprobante.rutaArchivo" label="Ruta o URL del archivo" outlined dense :rules="[v => !!v || 'Requerido']" />
            <q-input v-model="comprobante.formatoArchivo" label="Formato (PDF, JPG, PNG)" outlined dense :rules="[v => !!v || 'Requerido']" />
            <q-input v-model="comprobante.numeroOperacion" label="Numero de operacion bancaria" outlined dense />
            <q-input v-model="comprobante.fechaTransferencia" label="Fecha de transferencia" type="datetime-local" outlined dense :rules="[v => !!v || 'Requerido']" />
            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn type="submit" color="blue-9" label="Enviar" unelevated :loading="enviandoComp" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- dialog cancelar -->
    <q-dialog v-model="verCancelar" persistent>
      <q-card style="min-width: 340px">
        <q-bar class="bg-negative text-white">
          <q-icon name="cancel" />
          <div class="q-ml-sm">Cancelar transaccion</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <q-input v-model="motivoCancelacion" label="Motivo de cancelacion" outlined dense type="textarea" rows="3" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Volver" v-close-popup />
          <q-btn color="negative" label="Confirmar cancelacion" unelevated :loading="cancelando" @click="cancelarTx" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- dialog disputa -->
    <q-dialog v-model="verDisputa" persistent>
      <q-card style="min-width: 380px">
        <q-bar class="bg-orange text-white">
          <q-icon name="warning" />
          <div class="q-ml-sm">Reportar disputa</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <q-form @submit.prevent="enviarDisputa" class="column q-gutter-sm">
            <q-input v-model="disputa.motivo" label="Motivo" outlined dense :rules="[v => !!v || 'Requerido']" />
            <q-input v-model="disputa.descripcion" label="Descripcion detallada" outlined dense type="textarea" rows="4" :rules="[v => !!v || 'Requerido']" />
            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn type="submit" color="orange" label="Reportar" unelevated :loading="enviandoDisputa" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()

const tx = ref(null)
const cargando = ref(false)
const confirmando = ref(false)
const cancelando = ref(false)
const enviandoComp = ref(false)
const enviandoDisputa = ref(false)
const verComprobante = ref(false)
const verCancelar = ref(false)
const verDisputa = ref(false)
const motivoCancelacion = ref('')

const comprobante = reactive({
  transaccionId: null,
  nombreArchivo: '',
  rutaArchivo: '',
  formatoArchivo: '',
  numeroOperacion: '',
  fechaTransferencia: '',
})

const disputa = reactive({ motivo: '', descripcion: '' })

const usuarioId = computed(() => authStore.usuario?.id)

const puedeReportarComprobante = computed(() =>
  tx.value?.estadoActual === 'INICIADA' && tx.value?.compradorId === usuarioId.value
)
const puedeConfirmarPago = computed(() =>
  tx.value?.estadoActual === 'PAGO_REPORTADO' && tx.value?.vendedorId === usuarioId.value
)
const puedeCancelar = computed(() =>
  ['INICIADA', 'PENDIENTE_PAGO'].includes(tx.value?.estadoActual)
)
const puedeDisputar = computed(() =>
  ['INICIADA', 'PAGO_REPORTADO'].includes(tx.value?.estadoActual)
)

async function cargarDetalle() {
  cargando.value = true
  try {
    const res = await api.get(`/api/transaccion/${route.params.id}`)
    tx.value = res.data.datos ?? res.data
    comprobante.transaccionId = tx.value.id
  } catch (e) {
    console.error('error detalle', e)
  } finally {
    cargando.value = false
  }
}

async function confirmarPago() {
  confirmando.value = true
  try {
    await api.put(`/api/transaccion/${tx.value.id}/confirmar`)
    $q.notify({ type: 'positive', message: 'Pago confirmado. Transaccion finalizada.' })
    cargarDetalle()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al confirmar el pago.' })
  } finally {
    confirmando.value = false
  }
}

async function cancelarTx() {
  cancelando.value = true
  try {
    await api.put(`/api/transaccion/${tx.value.id}/cancelar?motivo=${encodeURIComponent(motivoCancelacion.value)}`)
    verCancelar.value = false
    $q.notify({ type: 'positive', message: 'Transaccion cancelada.' })
    cargarDetalle()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cancelar.' })
  } finally {
    cancelando.value = false
  }
}

async function enviarComprobante() {
  enviandoComp.value = true
  try {
    await api.post('/api/transaccion/comprobante', {
      ...comprobante,
      fechaTransferencia: new Date(comprobante.fechaTransferencia).toISOString(),
    })
    verComprobante.value = false
    $q.notify({ type: 'positive', message: 'Comprobante reportado.' })
    cargarDetalle()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al enviar el comprobante.' })
  } finally {
    enviandoComp.value = false
  }
}

async function enviarDisputa() {
  enviandoDisputa.value = true
  try {
    await api.post('/api/disputa', { transaccionId: tx.value.id, ...disputa })
    verDisputa.value = false
    $q.notify({ type: 'positive', message: 'Disputa reportada.' })
    cargarDetalle()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al reportar la disputa.' })
  } finally {
    enviandoDisputa.value = false
  }
}

function formatFecha(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function colorEstado(estado) {
  const colores = {
    INICIADA: 'blue', PENDIENTE_PAGO: 'orange', PAGO_REPORTADO: 'purple',
    PAGO_CONFIRMADO: 'teal', FINALIZADA: 'green', CANCELADA: 'grey',
    EN_DISPUTA: 'red', RESUELTA: 'cyan',
  }
  return colores[estado] || 'grey'
}

onMounted(cargarDetalle)
</script>

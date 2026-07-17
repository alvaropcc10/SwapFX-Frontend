<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-dark">Mis transacciones</div>
        <div class="text-caption text-grey-6">Historial de tus operaciones de intercambio</div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn color="green" label="Exportar Excel" icon="download" unelevated dense @click="exportarExcel" />
        <q-btn color="red" label="Exportar PDF" icon="picture_as_pdf" unelevated dense @click="exportarPDF" />
      </div>
    </div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="blue-9" size="3em" />
      <div class="text-grey q-mt-sm">Cargando...</div>
    </div>

    <div v-else-if="transacciones.length === 0" class="text-center q-pa-xl text-grey">
      <q-icon name="receipt_long" size="3rem" />
      <div class="q-mt-sm">No tienes transacciones aun.</div>
    </div>

    <div v-else>
      <q-card
        v-for="tx in transacciones"
        :key="tx.id"
        flat
        class="q-mb-sm cursor-pointer transaccion-card"
        style="border-radius:12px; border:1px solid #E3F2FD; transition: box-shadow 0.2s"
        @click="verDetalle(tx.id)"
        @mouseenter="$event.currentTarget.style.boxShadow='0 4px 20px rgba(21,101,192,0.12)'"
        @mouseleave="$event.currentTarget.style.boxShadow='none'"
      >
        <q-card-section>
          <div class="row items-center q-gutter-md">
            <div class="col">
              <div class="text-body2 text-weight-bold text-blue-9">{{ tx.codigo }}</div>
              <div class="text-caption text-grey">{{ formatFecha(tx.fechaInicio) }}</div>
            </div>
            <div class="col text-center">
              <div class="text-caption text-grey">Par</div>
              <div class="text-body2">{{ tx.monedaOrigen }} → {{ tx.monedaDestino }}</div>
            </div>
            <div class="col text-center">
              <div class="text-caption text-grey">Monto</div>
              <div class="text-body2">{{ tx.montoOrigen }}</div>
            </div>
            <div class="col text-center">
              <div class="text-caption text-grey">TC</div>
              <div class="text-body2">{{ tx.tipoCambioAplicado }}</div>
            </div>
            <div class="col-auto">
              <q-chip :color="colorEstado(tx.estadoActual)" text-color="white" dense size="sm">
                {{ tx.estadoActual }}
              </q-chip>
            </div>
            <div class="col-auto">
              <q-btn
                v-if="tx.estadoActual === 'FINALIZADA'"
                flat
                dense
                color="blue-9"
                label="Calificar"
                icon="star"
                @click.stop="abrirCalificar(tx)"
              />
            </div>
            <div class="col-auto">
              <q-icon name="chevron_right" color="grey" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- dialog calificar -->
    <q-dialog v-model="verCalificar">
      <q-card style="min-width: 360px">
        <q-bar class="bg-blue-9 text-white">
          <q-icon name="star" />
          <div class="q-ml-sm">Calificar a {{ contraparte.nombre }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section class="column items-center q-gutter-sm">
          <q-rating v-model="calificacion.puntuacion" size="2.5em" color="orange" icon="star_border" icon-selected="star" :max="5" />
          <q-input
            v-model="calificacion.comentario"
            label="Comentario (opcional)"
            outlined
            dense
            type="textarea"
            rows="3"
            class="full-width"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="blue-9"
            label="Enviar"
            unelevated
            :loading="enviandoCalificacion"
            :disable="calificacion.puntuacion === 0"
            @click="enviarCalificacion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const transacciones = ref([])
const cargando = ref(false)
const verCalificar = ref(false)
const enviandoCalificacion = ref(false)
const contraparte = reactive({ id: null, nombre: '' })
const calificacion = reactive({ transaccionId: null, puntuacion: 0, comentario: '' })

async function cargarTransacciones() {
  cargando.value = true
  try {
    const res = await api.get('/api/transaccion')
    transacciones.value = res.data.datos ?? res.data
  } catch (e) {
    console.error('error transacciones', e)
  } finally {
    cargando.value = false
  }
}

function verDetalle(id) {
  router.push(`/transacciones/${id}`)
}

function abrirCalificar(tx) {
  const usuarioId = authStore.usuario?.id
  if (usuarioId === tx.compradorId) {
    contraparte.id = tx.vendedorId
    contraparte.nombre = tx.nombreVendedor
  } else {
    contraparte.id = tx.compradorId
    contraparte.nombre = tx.nombreComprador
  }
  calificacion.transaccionId = tx.id
  calificacion.puntuacion = 0
  calificacion.comentario = ''
  verCalificar.value = true
}

async function enviarCalificacion() {
  enviandoCalificacion.value = true
  try {
    await api.post('/api/calificacion', {
      transaccionId: calificacion.transaccionId,
      usuarioCalificadoId: contraparte.id,
      puntuacion: calificacion.puntuacion,
      comentario: calificacion.comentario,
    })
    verCalificar.value = false
    $q.notify({ type: 'positive', message: 'Calificacion enviada.' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al enviar la calificacion.' })
  } finally {
    enviandoCalificacion.value = false
  }
}

function formatFecha(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function exportarExcel() {
  const datos = transacciones.value.map(tx => ({
    Codigo: tx.codigo,
    Estado: tx.estadoActual,
    'Moneda Origen': tx.monedaOrigen,
    'Moneda Destino': tx.monedaDestino,
    'Monto Origen': tx.montoOrigen,
    'Tipo de Cambio': tx.tipoCambioAplicado,
    Comprador: tx.nombreComprador,
    Vendedor: tx.nombreVendedor,
    'Fecha Inicio': formatFecha(tx.fechaInicio),
  }))

  const hoja = XLSX.utils.json_to_sheet(datos)
  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, hoja, 'Transacciones')
  XLSX.writeFile(libro, 'swapfx_transacciones.xlsx')
}

function exportarPDF() {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text('SwapFX - Reporte de Transacciones', 14, 16)
  doc.setFontSize(10)
  doc.text(`Generado: ${formatFecha(new Date().toISOString())}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [['Codigo', 'Estado', 'Par', 'Monto', 'TC', 'Fecha']],
    body: transacciones.value.map(tx => [
      tx.codigo,
      tx.estadoActual,
      `${tx.monedaOrigen} → ${tx.monedaDestino}`,
      tx.montoOrigen,
      tx.tipoCambioAplicado,
      formatFecha(tx.fechaInicio),
    ]),
  })

  doc.save('swapfx_transacciones.pdf')
}

function colorEstado(estado) {
  const colores = {
    INICIADA: 'blue',
    PENDIENTE_PAGO: 'orange',
    PAGO_REPORTADO: 'purple',
    PAGO_CONFIRMADO: 'teal',
    FINALIZADA: 'green',
    CANCELADA: 'grey',
    EN_DISPUTA: 'red',
    RESUELTA: 'cyan',
  }
  return colores[estado] || 'grey'
}

onMounted(cargarTransacciones)
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-blue-9 q-mb-md">Mis transacciones</div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="blue-9" size="3em" />
      <div class="text-grey q-mt-sm">Cargando...</div>
    </div>

    <div v-else-if="transacciones.length === 0" class="text-center q-pa-xl text-grey">
      <q-icon name="receipt_long" size="3rem" />
      <div class="q-mt-sm">No tienes transacciones aun.</div>
    </div>

    <div v-else>
      <q-card v-for="tx in transacciones" :key="tx.id" flat bordered class="q-mb-sm cursor-pointer" @click="verDetalle(tx.id)">
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
              <q-icon name="chevron_right" color="grey" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const transacciones = ref([])
const cargando = ref(false)

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

function formatFecha(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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

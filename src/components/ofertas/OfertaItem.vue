<template>
  <q-card
    flat
    class="q-mb-sm oferta-card"
    style="border-radius:12px; border:1px solid #E3F2FD; transition: box-shadow 0.2s"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    :style="hover ? 'box-shadow: 0 4px 20px rgba(21,101,192,0.15)' : ''"
  >
    <q-card-section class="q-pa-md">
      <div class="row items-center q-gutter-md">
        <div class="col-auto">
          <q-avatar size="42px" style="background: linear-gradient(135deg, #1565C0, #1E88E5)" text-color="white" class="text-subtitle1 text-weight-bold">
            {{ iniciales }}
          </q-avatar>
        </div>
        <div class="col">
          <div class="text-body2 text-weight-bold text-dark">{{ oferta.usuarioNombre }}</div>
          <div class="text-caption text-grey">{{ oferta.tipo === 'C' ? 'Compra' : 'Venta' }}</div>
          <div class="text-caption text-grey-6" v-if="totalCalificaciones > 0">
            <q-icon name="star" color="amber" size="12px" />
            {{ promedioCalificacion }} ({{ totalCalificaciones }} opiniones)
          </div>
          <div class="text-caption text-grey-5" v-else>Sin calificaciones aun</div>
        </div>

        <div class="col text-center">
          <div class="text-caption text-grey-6 q-mb-xs">Par</div>
          <q-chip dense color="blue-1" text-color="primary" class="text-weight-bold">
            {{ oferta.monedaOrigen }} → {{ oferta.monedaDestino }}
          </q-chip>
        </div>

        <div class="col text-center">
          <div class="text-caption text-grey-6 q-mb-xs">Monto</div>
          <div class="text-body2 text-weight-bold">{{ oferta.monto }}</div>
        </div>

        <div class="col text-center">
          <div class="text-caption text-grey-6 q-mb-xs">Tipo de cambio</div>
          <div class="text-h6 text-primary text-weight-bold">{{ oferta.tipoCambio }}</div>
        </div>

        <div class="col text-center">
          <div class="text-caption text-grey-6 q-mb-xs">Estado</div>
          <q-chip dense :color="oferta.estado === 'PUBLICADA' ? 'positive' : 'grey'" text-color="white" size="sm">
            {{ oferta.estado }}
          </q-chip>
        </div>

        <div class="col-auto">
          <q-btn
            unelevated
            round
            icon="swap_horiz"
            color="primary"
            size="sm"
            title="Iniciar transaccion"
            @click="$emit('iniciar', oferta)"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({ oferta: { type: Object, required: true } })
defineEmits(['iniciar'])

const hover = ref(false)

const iniciales = computed(() => {
  const nombre = props.oferta.usuarioNombre || ''
  return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

const calificaciones = ref([])

const totalCalificaciones = computed(() => calificaciones.value.length)

const promedioCalificacion = computed(() => {
  if (totalCalificaciones.value === 0) return 0
  const suma = calificaciones.value.reduce((acc, c) => acc + c.puntuacion, 0)
  return (suma / totalCalificaciones.value).toFixed(1)
})

async function cargarReputacion() {
  if (!props.oferta.usuarioId) return
  try {
    const res = await api.get(`/api/calificacion/${props.oferta.usuarioId}`)
    calificaciones.value = res.data.datos ?? res.data
  } catch (e) {
    console.error('error reputacion', e)
  }
}

onMounted(cargarReputacion)
</script>

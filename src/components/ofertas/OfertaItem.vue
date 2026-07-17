<template>
  <q-card flat bordered class="q-mb-sm">
    <q-card-section>
      <div class="row items-center q-gutter-md">
        <div class="col">
          <div class="row items-center q-gutter-xs">
            <q-avatar size="32px" color="blue-9" text-color="white" class="text-caption">
              {{ iniciales }}
            </q-avatar>
            <div>
              <div class="text-body2 text-weight-medium">{{ oferta.usuarioNombre }}</div>
              <div class="text-caption text-grey">{{ oferta.tipo === 'C' ? 'Compra' : 'Venta' }}</div>
              <div class="text-caption text-grey">
                <template v-if="totalCalificaciones > 0">
                  Reputacion: {{ promedioCalificacion }} <q-icon name="star" color="orange" size="14px" /> ({{ totalCalificaciones }} opiniones)
                </template>
                <template v-else>Sin calificaciones aun.</template>
              </div>
            </div>
          </div>
        </div>

        <div class="col text-center">
          <div class="text-caption text-grey">Par</div>
          <div class="text-body2 text-weight-bold">
            {{ oferta.monedaOrigen }} → {{ oferta.monedaDestino }}
          </div>
        </div>

        <div class="col text-center">
          <div class="text-caption text-grey">Monto</div>
          <div class="text-body2">{{ oferta.monto }}</div>
        </div>

        <div class="col text-center">
          <div class="text-caption text-grey">Tipo de cambio</div>
          <div class="text-body2 text-weight-bold text-blue-9">{{ oferta.tipoCambio }}</div>
        </div>

        <div class="col text-center">
          <div class="text-caption text-grey">Estado</div>
          <q-chip
            :color="oferta.estado === 'PUBLICADA' ? 'green' : 'grey'"
            text-color="white"
            dense
            size="sm"
          >
            {{ oferta.estado }}
          </q-chip>
        </div>

        <div class="col-auto">
          <q-btn
            flat
            dense
            round
            icon="swap_horiz"
            color="blue-9"
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

<template>
  <q-card flat bordered class="q-mb-md q-pa-sm">
    <q-card-section>
      <div class="row q-gutter-sm items-end">
        <q-select
          v-model="filtros.tipo"
          :options="opcionesTipo"
          label="Operacion"
          outlined
          dense
          clearable
          style="min-width: 140px"
          emit-value
          map-options
        />
        <q-select
          v-model="filtros.monedaOrigen"
          :options="opcionesMoneda"
          label="Moneda origen"
          outlined
          dense
          clearable
          style="min-width: 140px"
          emit-value
          map-options
        />
        <q-select
          v-model="filtros.monedaDestino"
          :options="opcionesMoneda"
          label="Moneda destino"
          outlined
          dense
          clearable
          style="min-width: 140px"
          emit-value
          map-options
        />
        <q-btn color="blue-9" label="Buscar" unelevated dense @click="emitFiltros" />
        <q-btn flat dense label="Limpiar" color="grey" @click="limpiar" />
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div class="row q-gutter-md">
        <div v-for="(val, key) in tiposCambio" :key="key" class="text-caption text-grey">
          <q-icon name="show_chart" size="xs" /> {{ key }}: {{ val }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import { obtenerTodosLosTipos } from '@/services/tipoCambioService'

const emit = defineEmits(['filtrar'])

const opcionesTipo = [
  { label: 'Compra', value: 'C' },
  { label: 'Venta', value: 'V' },
]
const opcionesMoneda = [
  { label: 'USD - Dolar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'PEN - Sol', value: 'PEN' },
]

const filtros = reactive({ tipo: null, monedaOrigen: null, monedaDestino: null })
const tiposCambio = ref({})

function emitFiltros() {
  emit('filtrar', { ...filtros })
}

function limpiar() {
  filtros.tipo = null
  filtros.monedaOrigen = null
  filtros.monedaDestino = null
  emit('filtrar', {})
}

onMounted(async () => {
  const tc = await obtenerTodosLosTipos()
  tiposCambio.value = {
    'USD → PEN': tc.usdPen.toFixed(4),
    'EUR → PEN': tc.eurPen.toFixed(4),
    'USD → EUR': tc.usdEur.toFixed(4),
  }
})
</script>

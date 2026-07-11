<template>
  <div>
    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="blue-9" size="3em" />
      <div class="text-grey q-mt-sm">Cargando ofertas...</div>
    </div>

    <div v-else-if="ofertas.length === 0" class="text-center q-pa-xl text-grey">
      <q-icon name="inbox" size="3rem" />
      <div class="q-mt-sm">No hay ofertas disponibles.</div>
    </div>

    <div v-else>
      <oferta-item
        v-for="oferta in ofertas"
        :key="oferta.id"
        :oferta="oferta"
        @iniciar="$emit('iniciar', oferta)"
      />
      <div class="row justify-center q-mt-md">
        <q-pagination
          v-model="paginaActual"
          :max="totalPaginas"
          direction-links
          color="blue-9"
          @update:model-value="$emit('cambiarPagina', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import OfertaItem from './OfertaItem.vue'

defineProps({
  ofertas: { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false },
  totalPaginas: { type: Number, default: 1 },
})
defineEmits(['iniciar', 'cambiarPagina'])

const paginaActual = ref(1)
</script>

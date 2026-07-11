<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-blue-9">Notificaciones</div>
      <q-btn flat dense label="Marcar todas como leidas" color="grey" @click="marcarTodas" />
    </div>

    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner color="blue-9" size="3em" />
    </div>

    <div v-else-if="notificaciones.length === 0" class="text-center q-pa-xl text-grey">
      <q-icon name="notifications_none" size="3rem" />
      <div class="q-mt-sm">No tienes notificaciones.</div>
    </div>

    <q-list v-else separator bordered class="rounded-borders">
      <q-item
        v-for="n in notificaciones"
        :key="n.id"
        :class="!n.leida ? 'bg-blue-1' : ''"
        clickable
        @click="marcarLeida(n)"
      >
        <q-item-section avatar>
          <q-icon
            :name="iconoTipo(n.tipo)"
            :color="!n.leida ? 'blue-9' : 'grey'"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ n.mensaje }}</q-item-label>
          <q-item-label caption>{{ n.tipo }} · {{ formatFecha(n.fechaCreacion) }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge v-if="!n.leida" color="blue-9" label="Nuevo" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const notificaciones = ref([])
const cargando = ref(false)

async function cargarNotificaciones() {
  cargando.value = true
  try {
    const res = await api.get('/api/notificacion')
    notificaciones.value = res.data.datos ?? res.data
  } catch (e) {
    console.error('error notificaciones', e)
  } finally {
    cargando.value = false
  }
}

async function marcarLeida(n) {
  if (n.leida) return
  try {
    await api.put(`/api/notificacion/${n.id}/leida`)
    n.leida = true
  } catch (e) {
    console.error('error marcar leida', e)
  }
}

async function marcarTodas() {
  const noLeidas = notificaciones.value.filter(n => !n.leida)
  for (const n of noLeidas) {
    await marcarLeida(n)
  }
}

function iconoTipo(tipo) {
  const iconos = {
    TRANSACCION: 'swap_horiz',
    PAGO: 'payment',
    FINALIZADA: 'check_circle',
    CANCELADA: 'cancel',
    DISPUTA: 'warning',
  }
  return iconos[tipo] || 'notifications'
}

function formatFecha(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(cargarNotificaciones)
</script>

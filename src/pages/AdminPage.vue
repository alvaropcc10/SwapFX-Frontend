<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-orange q-mb-md">Panel de administracion — Grupo 2 / Alvaro</div>

    <q-tabs v-model="tab" dense align="left" class="text-orange">
      <q-tab name="dashboard" label="Dashboard" icon="dashboard" />
      <q-tab name="usuarios" label="Usuarios" icon="people" />
      <q-tab name="transacciones" label="Transacciones" icon="receipt_long" />
      <q-tab name="disputas" label="Disputas" icon="warning" />
      <q-tab name="documentos" label="Documentos" icon="badge" />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <!-- dashboard -->
      <q-tab-panel name="dashboard">
        <div class="row q-gutter-md">
          <q-card flat bordered class="col-grow">
            <q-card-section>
              <div class="text-caption text-grey">Total usuarios</div>
              <div class="text-h5 text-orange">{{ totalUsuarios }}</div>
            </q-card-section>
          </q-card>
          <q-card flat bordered class="col-grow">
            <q-card-section>
              <div class="text-caption text-grey">Usuarios activos</div>
              <div class="text-h5 text-orange">{{ usuariosActivos }}</div>
            </q-card-section>
          </q-card>
          <q-card flat bordered class="col-grow">
            <q-card-section>
              <div class="text-caption text-grey">Total transacciones</div>
              <div class="text-h5 text-orange">{{ totalTransacciones }}</div>
            </q-card-section>
          </q-card>
          <q-card flat bordered class="col-grow">
            <q-card-section>
              <div class="text-caption text-grey">Transacciones finalizadas</div>
              <div class="text-h5 text-orange">{{ transaccionesFinalizadas }}</div>
            </q-card-section>
          </q-card>
          <q-card flat bordered class="col-grow">
            <q-card-section>
              <div class="text-caption text-grey">Disputas activas</div>
              <div class="text-h5 text-orange">{{ disputasActivas }}</div>
            </q-card-section>
          </q-card>
          <q-card flat bordered class="col-grow">
            <q-card-section>
              <div class="text-caption text-grey">Tasa de finalizacion</div>
              <div class="text-h5 text-orange">{{ tasaFinalizacion }}%</div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- usuarios -->
      <q-tab-panel name="usuarios">
        <div v-if="cargandoUsuarios" class="text-center q-pa-xl"><q-spinner color="orange" size="2em" /></div>
        <q-table
          v-else
          :rows="usuarios"
          :columns="columnasUsuarios"
          row-key="id"
          flat
          bordered
          dense
        >
          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-chip :color="props.row.isActive ? 'green' : 'red'" text-color="white" dense size="sm">
                {{ props.row.isActive ? 'Activo' : 'Bloqueado' }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                flat dense size="sm"
                :icon="props.row.isActive ? 'block' : 'check_circle'"
                :color="props.row.isActive ? 'negative' : 'positive'"
                @click="cambiarEstado(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- transacciones -->
      <q-tab-panel name="transacciones">
        <div v-if="cargandoTx" class="text-center q-pa-xl"><q-spinner color="orange" size="2em" /></div>
        <q-table
          v-else
          :rows="transacciones"
          :columns="columnasTx"
          row-key="id"
          flat
          bordered
          dense
        >
          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-chip :color="colorEstado(props.row.estadoActual)" text-color="white" dense size="sm">
                {{ props.row.estadoActual }}
              </q-chip>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- disputas -->
      <q-tab-panel name="disputas">
        <div v-if="cargandoDisputas" class="text-center q-pa-xl"><q-spinner color="orange" size="2em" /></div>
        <div v-else-if="disputas.length === 0" class="text-grey text-center q-pa-xl">No hay disputas activas.</div>
        <q-list v-else separator bordered>
          <q-item v-for="d in disputas" :key="d.id">
            <q-item-section>
              <q-item-label>Disputa #{{ d.id }} — TX {{ d.transaccionId }}</q-item-label>
              <q-item-label caption>{{ d.motivo }} · {{ d.descripcion }}</q-item-label>
              <q-item-label caption>Estado: {{ d.estado }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                v-if="d.estado !== 'RESUELTA'"
                color="orange"
                dense
                unelevated
                label="Resolver"
                @click="abrirResolver(d)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>
      <!-- documentos -->
      <q-tab-panel name="documentos">
        <div v-if="cargandoUsuarios" class="text-center q-pa-xl"><q-spinner color="orange" size="2em" /></div>
        <div v-else-if="usuariosSinValidar.length === 0" class="text-grey text-center q-pa-xl">No hay documentos pendientes.</div>
        <q-list v-else separator bordered>
          <q-item v-for="u in usuariosSinValidar" :key="u.id">
            <q-item-section>
              <q-item-label>{{ u.nombres }} {{ u.apellidos }}</q-item-label>
              <q-item-label caption>{{ u.email }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                color="orange"
                dense
                unelevated
                label="Aprobar"
                :loading="aprobandoId === u.id"
                @click="aprobarIdentidad(u)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>
    </q-tab-panels>

    <!-- dialog resolver disputa -->
    <q-dialog v-model="verResolver" persistent>
      <q-card style="min-width: 380px">
        <q-bar class="bg-orange text-white">
          <q-icon name="gavel" />
          <div class="q-ml-sm">Resolver disputa</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <q-form @submit.prevent="resolverDisputa" class="column q-gutter-sm">
            <q-input v-model="resolucion.resolucion" label="Resolucion" outlined dense type="textarea" rows="3" :rules="[v => !!v || 'Requerido']" />
            <q-select
              v-model="resolucion.estadoFinal"
              :options="['RESUELTA']"
              label="Estado final"
              outlined dense
            />
            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn type="submit" color="orange" label="Confirmar" unelevated :loading="resolviendo" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/services/api'

const $q = useQuasar()
const tab = ref('dashboard')
const usuarios = ref([])
const transacciones = ref([])
const disputas = ref([])
const cargandoUsuarios = ref(false)
const cargandoTx = ref(false)
const cargandoDisputas = ref(false)
const verResolver = ref(false)
const resolviendo = ref(false)
const disputaSeleccionada = ref(null)
const aprobandoId = ref(null)

const resolucion = reactive({ disputaId: null, resolucion: '', estadoFinal: 'RESUELTA' })

const columnasUsuarios = [
  { name: 'id', label: 'ID', field: 'id', align: 'center' },
  { name: 'nombres', label: 'Nombres', field: 'nombres', align: 'left' },
  { name: 'apellidos', label: 'Apellidos', field: 'apellidos', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'tipo', label: 'Rol', field: 'tipo', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'isActive', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const columnasTx = [
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left' },
  { name: 'comprador', label: 'Comprador', field: 'nombreComprador', align: 'left' },
  { name: 'vendedor', label: 'Vendedor', field: 'nombreVendedor', align: 'left' },
  { name: 'monto', label: 'Monto', field: 'montoOrigen', align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estadoActual', align: 'center' },
  { name: 'fecha', label: 'Fecha', field: 'fechaInicio', align: 'left', format: v => v ? new Date(v).toLocaleDateString('es-PE') : '-' },
]

const totalUsuarios = computed(() => usuarios.value.length)
const usuariosActivos = computed(() => usuarios.value.filter(u => u.isActive).length)
const totalTransacciones = computed(() => transacciones.value.length)
const transaccionesFinalizadas = computed(() => transacciones.value.filter(t => t.estadoActual === 'FINALIZADA').length)
const disputasActivas = computed(() => disputas.value.filter(d => d.estado !== 'RESUELTA').length)
const usuariosSinValidar = computed(() => usuarios.value.filter(u => !u.identidadValidada))
const tasaFinalizacion = computed(() => {
  if (totalTransacciones.value === 0) return 0
  return ((transaccionesFinalizadas.value / totalTransacciones.value) * 100).toFixed(1)
})

async function cargarUsuarios() {
  cargandoUsuarios.value = true
  try {
    const res = await api.get('/api/administracion/usuarios')
    usuarios.value = res.data.datos ?? res.data
  } catch (e) {
    console.error('error usuarios admin', e)
  } finally {
    cargandoUsuarios.value = false
  }
}

async function cargarTransacciones() {
  cargandoTx.value = true
  try {
    const res = await api.get('/api/administracion/transacciones')
    transacciones.value = res.data.datos ?? res.data
  } catch (e) {
    console.error('error tx admin', e)
  } finally {
    cargandoTx.value = false
  }
}

async function cargarDisputas() {
  cargandoDisputas.value = true
  try {
    const res = await api.get('/api/disputa')
    disputas.value = res.data.datos ?? res.data
  } catch (e) {
    console.error('error disputas', e)
  } finally {
    cargandoDisputas.value = false
  }
}

async function cambiarEstado(usuario) {
  try {
    await api.put('/api/administracion/usuarios/estado', {
      usuarioId: usuario.id,
      isActive: !usuario.isActive,
      motivo: usuario.isActive ? 'Bloqueado por administrador' : 'Habilitado por administrador'
    })
    $q.notify({ type: 'positive', message: usuario.isActive ? 'Usuario bloqueado.' : 'Usuario habilitado.' })
    cargarUsuarios()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cambiar estado.' })
  }
}

async function aprobarIdentidad(usuario) {
  aprobandoId.value = usuario.id
  try {
    await api.put('/api/administracion/usuarios/validar-identidad', { usuarioId: usuario.id })
    $q.notify({ type: 'positive', message: 'Identidad validada.' })
    cargarUsuarios()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al validar la identidad.' })
  } finally {
    aprobandoId.value = null
  }
}

function abrirResolver(d) {
  disputaSeleccionada.value = d
  resolucion.disputaId = d.id
  resolucion.resolucion = ''
  resolucion.estadoFinal = 'RESUELTA'
  verResolver.value = true
}

async function resolverDisputa() {
  resolviendo.value = true
  try {
    await api.put('/api/disputa/resolver', resolucion)
    verResolver.value = false
    $q.notify({ type: 'positive', message: 'Disputa resuelta.' })
    cargarDisputas()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al resolver.' })
  } finally {
    resolviendo.value = false
  }
}

function colorEstado(estado) {
  const colores = {
    INICIADA: 'blue', PENDIENTE_PAGO: 'orange', PAGO_REPORTADO: 'purple',
    PAGO_CONFIRMADO: 'teal', FINALIZADA: 'green', CANCELADA: 'grey',
    EN_DISPUTA: 'red', RESUELTA: 'cyan',
  }
  return colores[estado] || 'grey'
}

onMounted(() => {
  cargarUsuarios()
  cargarTransacciones()
  cargarDisputas()
})
</script>

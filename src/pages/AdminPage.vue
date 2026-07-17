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
      <q-tab-panel name="dashboard" class="q-pa-none">
        <div class="q-pa-md">

          <!-- filtro periodo -->
          <div class="row items-center justify-between q-mb-lg">
            <div class="text-h6 text-weight-bold text-dark">Resumen general</div>
            <q-select
              v-model="periodo"
              :options="opcionesPeriodo"
              dense outlined
              style="min-width:160px"
              emit-value map-options
              @update:model-value="actualizarDashboard"
            />
          </div>

          <!-- KPI cards -->
          <div class="row q-gutter-md q-mb-lg">
            <q-card flat class="col kpi-card" style="border-radius:12px; border-left: 4px solid #1565C0">
              <q-card-section class="q-pa-md">
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-caption text-grey-6 text-uppercase" style="letter-spacing:1px">Usuarios registrados</div>
                    <div class="text-h4 text-weight-bold text-dark q-mt-xs">{{ stats.totalUsuarios }}</div>
                  </div>
                  <q-icon name="people" size="40px" color="blue-3" />
                </div>
              </q-card-section>
            </q-card>

            <q-card flat class="col kpi-card" style="border-radius:12px; border-left: 4px solid #2E7D32">
              <q-card-section class="q-pa-md">
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-caption text-grey-6 text-uppercase" style="letter-spacing:1px">Usuarios activos</div>
                    <div class="text-h4 text-weight-bold text-dark q-mt-xs">{{ stats.usuariosActivos }}</div>
                  </div>
                  <q-icon name="person_check" size="40px" color="green-3" />
                </div>
              </q-card-section>
            </q-card>

            <q-card flat class="col kpi-card" style="border-radius:12px; border-left: 4px solid #1E88E5">
              <q-card-section class="q-pa-md">
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-caption text-grey-6 text-uppercase" style="letter-spacing:1px">Transacciones</div>
                    <div class="text-h4 text-weight-bold text-dark q-mt-xs">{{ stats.totalTransacciones }}</div>
                  </div>
                  <q-icon name="receipt_long" size="40px" color="blue-2" />
                </div>
              </q-card-section>
            </q-card>

            <q-card flat class="col kpi-card" style="border-radius:12px; border-left: 4px solid #C62828">
              <q-card-section class="q-pa-md">
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-caption text-grey-6 text-uppercase" style="letter-spacing:1px">Disputas activas</div>
                    <div class="text-h4 text-weight-bold text-dark q-mt-xs">{{ stats.disputasActivas }}</div>
                  </div>
                  <q-icon name="warning" size="40px" color="red-3" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- graficos -->
          <div class="row q-gutter-md q-mb-lg">
            <!-- barras transacciones por dia -->
            <q-card flat class="col-12 col-md-7" style="border-radius:12px; border:1px solid #E3F2FD">
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold q-mb-md">Transacciones por dia</div>
                <canvas ref="barChartRef" height="120"></canvas>
              </q-card-section>
            </q-card>

            <!-- donut estados -->
            <q-card flat class="col-12 col-md-4" style="border-radius:12px; border:1px solid #E3F2FD">
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold q-mb-md">Estados de transaccion</div>
                <canvas ref="donutChartRef" height="120"></canvas>
                <div class="q-mt-md">
                  <div v-for="(item, i) in estadosData" :key="i" class="row items-center q-mb-xs">
                    <div class="q-mr-sm" :style="`width:12px;height:12px;border-radius:2px;background:${item.color}`"></div>
                    <div class="text-caption">{{ item.label }}: <strong>{{ item.valor }}</strong></div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- disputas urgentes -->
          <q-card flat style="border-radius:12px; border:1px solid #FFEBEE">
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-subtitle1 text-weight-bold text-negative">Disputas que requieren atencion</div>
                <q-btn flat dense label="Ver todas" color="negative" @click="tab = 'disputas'" />
              </div>
              <div v-if="disputasUrgentes.length === 0" class="text-grey text-center q-pa-md">No hay disputas activas.</div>
              <q-table
                v-else
                :rows="disputasUrgentes"
                :columns="columnasDisputasUrgentes"
                row-key="id"
                flat dense hide-bottom
                :rows-per-page-options="[5]"
              >
                <template #body-cell-estado="props">
                  <q-td :props="props">
                    <q-chip dense color="red-1" text-color="negative" size="sm">{{ props.row.estado }}</q-chip>
                  </q-td>
                </template>
                <template #body-cell-accion="props">
                  <q-td :props="props">
                    <q-btn flat dense size="sm" color="negative" label="Revisar" @click="tab = 'disputas'" />
                  </q-td>
                </template>
              </q-table>
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
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/services/api'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, ArcElement } from 'chart.js'
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, ArcElement)

const $q = useQuasar()
const tab = ref('dashboard')
const barChartRef = ref(null)
const donutChartRef = ref(null)
let barChart = null
let donutChart = null

const periodo = ref(30)
const opcionesPeriodo = [
  { label: 'Ultimos 7 dias', value: 7 },
  { label: 'Ultimos 30 dias', value: 30 },
  { label: 'Ultimos 90 dias', value: 90 },
]
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

const usuariosSinValidar = computed(() => usuarios.value.filter(u => !u.identidadValidada))

const stats = computed(() => ({
  totalUsuarios: usuarios.value.length,
  usuariosActivos: usuarios.value.filter(u => u.isActive).length,
  totalTransacciones: transacciones.value.length,
  disputasActivas: disputas.value.filter(d => d.estado !== 'RESUELTA').length,
  tasaFinalizacion: transacciones.value.length
    ? Math.round((transacciones.value.filter(t => t.estadoActual === 'FINALIZADA').length / transacciones.value.length) * 100)
    : 0
}))

const disputasUrgentes = computed(() => disputas.value.filter(d => d.estado !== 'RESUELTA').slice(0, 5))

const columnasDisputasUrgentes = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'transaccionId', label: 'Transaccion', field: 'transaccionId', align: 'left' },
  { name: 'motivo', label: 'Motivo', field: 'motivo', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'accion', label: 'Accion', field: 'accion', align: 'center' },
]

const estadosData = computed(() => {
  const conteo = {}
  transacciones.value.forEach(t => {
    conteo[t.estadoActual] = (conteo[t.estadoActual] || 0) + 1
  })
  const colores = {
    FINALIZADA: '#2E7D32', INICIADA: '#1565C0', PAGO_REPORTADO: '#7B1FA2',
    CANCELADA: '#757575', EN_DISPUTA: '#C62828', RESUELTA: '#00838F'
  }
  return Object.entries(conteo).map(([label, valor]) => ({
    label, valor, color: colores[label] || '#90A4AE'
  }))
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

function transaccionesPorDia() {
  const dias = periodo.value
  const hoy = new Date()
  const fechas = []
  const conteos = []
  for (let i = dias - 1; i >= 0; i--) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() - i)
    const key = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
    fechas.push(key)
    const inicio = new Date(fecha); inicio.setHours(0,0,0,0)
    const fin = new Date(fecha); fin.setHours(23,59,59,999)
    conteos.push(transacciones.value.filter(t => {
      const f = new Date(t.fechaInicio)
      return f >= inicio && f <= fin
    }).length)
  }
  return { fechas, conteos }
}

function actualizarGraficos() {
  nextTick(() => {
    const { fechas, conteos } = transaccionesPorDia()
    if (barChartRef.value) {
      if (barChart) barChart.destroy()
      barChart = new Chart(barChartRef.value, {
        type: 'bar',
        data: {
          labels: fechas,
          datasets: [{ label: 'Transacciones', data: conteos, backgroundColor: '#1E88E5', borderRadius: 4 }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
      })
    }
    if (donutChartRef.value && estadosData.value.length > 0) {
      if (donutChart) donutChart.destroy()
      donutChart = new Chart(donutChartRef.value, {
        type: 'doughnut',
        data: {
          labels: estadosData.value.map(e => e.label),
          datasets: [{ data: estadosData.value.map(e => e.valor), backgroundColor: estadosData.value.map(e => e.color), borderWidth: 2 }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      })
    }
  })
}

function actualizarDashboard() {
  actualizarGraficos()
}

watch(tab, (nuevoTab) => {
  if (nuevoTab === 'dashboard') actualizarGraficos()
})

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
  setTimeout(actualizarGraficos, 500)
})
</script>

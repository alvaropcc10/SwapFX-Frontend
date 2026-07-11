<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-blue-9">Ofertas disponibles</div>
      <div class="row q-gutter-sm">
        <q-btn outline color="blue-9" label="Mis ofertas" icon="list" @click="verMisOfertas = true" />
        <q-btn color="blue-9" label="Publicar oferta" icon="add" unelevated @click="verPublicar = true" />
      </div>
    </div>

    <oferta-filtro @filtrar="aplicarFiltros" />
    <oferta-lista
      :ofertas="ofertas"
      :cargando="cargando"
      :total-paginas="totalPaginas"
      @iniciar="iniciarTransaccion"
      @cambiar-pagina="cambiarPagina"
    />

    <!-- dialog publicar oferta -->
    <q-dialog v-model="verPublicar" persistent>
      <q-card style="min-width: 420px">
        <q-bar class="bg-blue-9 text-white">
          <q-icon name="add" />
          <div class="q-ml-sm">Publicar nueva oferta</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <q-form @submit.prevent="publicarOferta" class="column q-gutter-sm">
            <q-select
              v-model="nuevaOferta.tipo"
              :options="[{ label: 'Compra', value: 'C' }, { label: 'Venta', value: 'V' }]"
              label="Tipo de operacion"
              outlined dense emit-value map-options
              :rules="[v => !!v || 'Requerido']"
            />
            <div class="row q-gutter-sm">
              <q-select
                v-model="nuevaOferta.monedaOrigenId"
                :options="monedas"
                label="Moneda origen"
                outlined dense emit-value map-options
                class="col"
                :rules="[v => !!v || 'Requerido']"
              />
              <q-select
                v-model="nuevaOferta.monedaDestinoId"
                :options="monedas"
                label="Moneda destino"
                outlined dense emit-value map-options
                class="col"
                :rules="[v => !!v || 'Requerido']"
              />
            </div>
            <q-input v-model.number="nuevaOferta.monto" label="Monto" type="number" outlined dense :rules="[v => v > 0 || 'Debe ser mayor a 0']" />
            <q-input v-model.number="nuevaOferta.tipoCambio" label="Tipo de cambio" type="number" step="0.0001" outlined dense :rules="[v => v > 0 || 'Debe ser mayor a 0']" />
            <q-input v-model.number="nuevaOferta.validezHoras" label="Validez (horas)" type="number" outlined dense />
            <q-input v-model="nuevaOferta.notas" label="Notas (opcional)" outlined dense />
            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn type="submit" color="blue-9" label="Publicar" unelevated :loading="publicando" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- dialog mis ofertas -->
    <q-dialog v-model="verMisOfertas">
      <q-card style="min-width: 600px">
        <q-bar class="bg-blue-9 text-white">
          <q-icon name="list" />
          <div class="q-ml-sm">Mis ofertas</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <div v-if="misOfertas.length === 0" class="text-grey text-center q-pa-md">No tienes ofertas publicadas.</div>
          <q-list v-else separator>
            <q-item v-for="o in misOfertas" :key="o.id">
              <q-item-section>
                <q-item-label>{{ o.monedaOrigen }} → {{ o.monedaDestino }} | Monto: {{ o.monto }} | TC: {{ o.tipoCambio }}</q-item-label>
                <q-item-label caption>{{ o.tipo === 'C' ? 'Compra' : 'Venta' }} · {{ o.estado }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round dense icon="delete" color="negative" @click="eliminarOferta(o.id)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- dialog confirmar transaccion -->
    <q-dialog v-model="verConfirmarTx">
      <q-card style="min-width: 380px">
        <q-bar class="bg-blue-9 text-white">
          <q-icon name="swap_horiz" />
          <div class="q-ml-sm">Iniciar transaccion</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section v-if="ofertaSeleccionada">
          <div class="q-gutter-xs">
            <div><strong>Par:</strong> {{ ofertaSeleccionada.monedaOrigen }} → {{ ofertaSeleccionada.monedaDestino }}</div>
            <div><strong>Monto:</strong> {{ ofertaSeleccionada.monto }}</div>
            <div><strong>Tipo de cambio:</strong> {{ ofertaSeleccionada.tipoCambio }}</div>
            <div><strong>Contraparte:</strong> {{ ofertaSeleccionada.usuarioNombre }}</div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="blue-9" label="Confirmar" unelevated :loading="iniciando" @click="confirmarTransaccion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import OfertaFiltro from '@/components/ofertas/OfertaFiltro.vue'
import OfertaLista from '@/components/ofertas/OfertaLista.vue'

const $q = useQuasar()
const router = useRouter()

const ofertas = ref([])
const misOfertas = ref([])
const cargando = ref(false)
const publicando = ref(false)
const iniciando = ref(false)
const verPublicar = ref(false)
const verMisOfertas = ref(false)
const verConfirmarTx = ref(false)
const ofertaSeleccionada = ref(null)
const paginaActual = ref(1)
const totalPaginas = ref(1)

const monedas = [
  { label: 'USD', value: 1 },
  { label: 'EUR', value: 2 },
  { label: 'PEN', value: 3 },
]

const nuevaOferta = reactive({
  tipo: null,
  monedaOrigenId: null,
  monedaDestinoId: null,
  monto: null,
  tipoCambio: null,
  validezHoras: 24,
  notas: '',
})

const filtrosActivos = ref({})

async function cargarOfertas() {
  cargando.value = true
  try {
    const params = { ...filtrosActivos.value }
    const res = await api.get('/api/oferta', { params })
    ofertas.value = res.data
    totalPaginas.value = 1
  } catch (e) {
    console.error('error cargando ofertas', e)
  } finally {
    cargando.value = false
  }
}

async function cargarMisOfertas() {
  try {
    const res = await api.get('/api/oferta')
    misOfertas.value = res.data
  } catch (e) {
    console.error('error mis ofertas', e)
  }
}

function aplicarFiltros(filtros) {
  filtrosActivos.value = filtros
  cargarOfertas(1)
}

function cambiarPagina(p) {
  paginaActual.value = p
  cargarOfertas(p)
}

function iniciarTransaccion(oferta) {
  ofertaSeleccionada.value = oferta
  verConfirmarTx.value = true
}

async function confirmarTransaccion() {
  iniciando.value = true
  try {
    await api.post('/api/transaccion/iniciar', { ofertaId: ofertaSeleccionada.value.id })
    verConfirmarTx.value = false
    $q.notify({ type: 'positive', message: 'Transaccion iniciada correctamente' })
    router.push('/transacciones')
  } catch {
    $q.notify({ type: 'negative', message: 'Error al iniciar la transaccion' })
  } finally {
    iniciando.value = false
  }
}

async function publicarOferta() {
  publicando.value = true
  try {
    await api.post('/api/oferta', nuevaOferta)
    verPublicar.value = false
    $q.notify({ type: 'positive', message: 'Oferta publicada correctamente' })
    cargarOfertas()
    Object.assign(nuevaOferta, { tipo: null, monedaOrigenId: null, monedaDestinoId: null, monto: null, tipoCambio: null, validezHoras: 24, notas: '' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al publicar la oferta' })
  } finally {
    publicando.value = false
  }
}

async function eliminarOferta(id) {
  try {
    await api.delete(`/api/oferta/${id}`)
    $q.notify({ type: 'positive', message: 'Oferta eliminada' })
    cargarMisOfertas()
    cargarOfertas()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar la oferta' })
  }
}

onMounted(() => {
  cargarOfertas()
  cargarMisOfertas()
})
</script>

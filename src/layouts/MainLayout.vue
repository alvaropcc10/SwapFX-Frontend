<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated style="background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleDrawer" color="white" />
        <q-toolbar-title>
          <div class="row items-center q-gutter-xs">
            <q-icon name="swap_horiz" size="28px" color="amber" />
            <span class="text-weight-bold text-white" style="font-size:20px;letter-spacing:1px">SwapFX</span>
            <q-badge color="amber" text-color="dark" label="P2P" class="q-ml-xs" style="font-size:9px" />
          </div>
        </q-toolbar-title>
        <q-btn flat round dense icon="notifications" to="/notificaciones" color="white">
          <q-badge color="red" floating v-if="notifCount > 0">{{ notifCount }}</q-badge>
        </q-btn>
        <q-btn flat round dense icon="account_circle" color="white">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item-label header class="text-weight-bold">{{ authStore.nombreCompleto }}</q-item-label>
              <q-item-label caption class="q-px-md q-pb-sm text-grey">{{ authStore.usuario?.email }}</q-item-label>
              <q-separator />
              <q-item clickable v-close-popup to="/perfil">
                <q-item-section avatar><q-icon name="person" color="primary" /></q-item-section>
                <q-item-section>Mi perfil</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="cerrarSesion">
                <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
                <q-item-section class="text-negative">Cerrar sesion</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOpen" show-if-above bordered :width="220" style="background: #F8FAFF">
      <div class="q-pa-md q-pb-sm">
        <div class="text-caption text-grey-6 text-uppercase text-weight-bold" style="letter-spacing:1px">Navegacion</div>
      </div>
      <q-list padding>
        <q-item clickable v-ripple to="/" exact active-class="bg-blue-1 text-primary" class="rounded-borders q-mb-xs">
          <q-item-section avatar><q-icon name="swap_horiz" /></q-item-section>
          <q-item-section>Ofertas</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/transacciones" active-class="bg-blue-1 text-primary" class="rounded-borders q-mb-xs">
          <q-item-section avatar><q-icon name="receipt_long" /></q-item-section>
          <q-item-section>Transacciones</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/notificaciones" active-class="bg-blue-1 text-primary" class="rounded-borders q-mb-xs">
          <q-item-section avatar><q-icon name="notifications" /></q-item-section>
          <q-item-section>Notificaciones</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/perfil" active-class="bg-blue-1 text-primary" class="rounded-borders q-mb-xs">
          <q-item-section avatar><q-icon name="person" /></q-item-section>
          <q-item-section>Mi perfil</q-item-section>
        </q-item>
        <q-separator v-if="authStore.esAdmin" class="q-my-sm" />
        <q-item v-if="authStore.esAdmin" clickable v-ripple to="/admin" active-class="bg-orange-1 text-orange" class="rounded-borders">
          <q-item-section avatar><q-icon name="admin_panel_settings" :color="authStore.esAdmin ? 'orange' : 'grey'" /></q-item-section>
          <q-item-section class="text-orange text-weight-medium">Administracion</q-item-section>
        </q-item>
      </q-list>

      <div class="absolute-bottom q-pa-md">
        <q-separator class="q-mb-md" />
        <div class="row items-center q-gutter-sm">
          <q-avatar size="32px" color="primary" text-color="white" class="text-caption">
            {{ authStore.nombreCompleto.charAt(0) }}
          </q-avatar>
          <div>
            <div class="text-body2 text-weight-medium">{{ authStore.nombreCompleto }}</div>
            <div class="text-caption text-grey">{{ authStore.esAdmin ? 'Administrador' : 'Usuario' }}</div>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const drawerOpen = ref(false)
const notifCount = ref(0)

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value
}

function cerrarSesion() {
  authStore.logout()
  router.push('/login')
}
</script>

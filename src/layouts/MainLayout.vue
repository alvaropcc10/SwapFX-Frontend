<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-blue-9">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleDrawer" />
        <q-toolbar-title class="text-weight-bold">SwapFX</q-toolbar-title>
        <q-btn flat round dense icon="notifications" to="/notificaciones">
          <q-badge color="red" floating v-if="notifCount > 0">{{ notifCount }}</q-badge>
        </q-btn>
        <q-btn flat round dense icon="account_circle">
          <q-menu>
            <q-list style="min-width: 180px">
              <q-item-label header>{{ authStore.nombreCompleto }}</q-item-label>
              <q-separator />
              <q-item clickable v-close-popup to="/perfil">
                <q-item-section avatar><q-icon name="person" /></q-item-section>
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

    <q-drawer v-model="drawerOpen" show-if-above bordered>
      <q-list padding>
        <q-item-label header class="text-blue-9 text-weight-bold">Menu</q-item-label>
        <q-item clickable v-ripple to="/" exact>
          <q-item-section avatar><q-icon name="swap_horiz" /></q-item-section>
          <q-item-section>Ofertas</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/transacciones">
          <q-item-section avatar><q-icon name="receipt_long" /></q-item-section>
          <q-item-section>Transacciones</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/notificaciones">
          <q-item-section avatar><q-icon name="notifications" /></q-item-section>
          <q-item-section>Notificaciones</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/perfil">
          <q-item-section avatar><q-icon name="person" /></q-item-section>
          <q-item-section>Mi perfil</q-item-section>
        </q-item>
        <q-separator v-if="authStore.esAdmin" class="q-my-sm" />
        <q-item v-if="authStore.esAdmin" clickable v-ripple to="/admin">
          <q-item-section avatar><q-icon name="admin_panel_settings" color="orange" /></q-item-section>
          <q-item-section class="text-orange">Administracion</q-item-section>
        </q-item>
      </q-list>
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

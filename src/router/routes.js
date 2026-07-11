const routes = [
  {
    path: '/login',
    component: () => import('@/pages/LoginPage.vue')
  },
  {
    path: '/register',
    component: () => import('@/pages/RegisterPage.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('@/pages/OfertasPage.vue') },
      { path: 'transacciones', component: () => import('@/pages/TransaccionesPage.vue') },
      { path: 'transacciones/:id', component: () => import('@/pages/TransaccionDetallePage.vue') },
      { path: 'notificaciones', component: () => import('@/pages/NotificacionesPage.vue') },
      { path: 'perfil', component: () => import('@/pages/MiPerfilPage.vue') },
      { path: 'admin', component: () => import('@/pages/AdminPage.vue'), meta: { requiresAdmin: true } },
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue')
  }
]

export default routes

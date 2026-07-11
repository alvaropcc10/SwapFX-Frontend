import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(JSON.parse(localStorage.getItem('swapfx_usuario') || 'null'))
  const token = ref(localStorage.getItem('swapfx_token') || '')

  const estaLogueado = computed(() => !!token.value)
  const esAdmin = computed(() => usuario.value?.tipo === 'A')
  const nombreCompleto = computed(() => {
    if (!usuario.value) return ''
    return (usuario.value.nombres || '') + ' ' + (usuario.value.apellidos || '')
  })

  async function login(email, password) {
    const res = await api.post('/api/usuario/signin', { email, password })
    const data = res.data
    token.value = data.token
    usuario.value = {
      id: data.id,
      nombres: data.nombres,
      apellidos: data.apellidos,
      email: data.email,
      tipo: data.tipo
    }
    localStorage.setItem('swapfx_token', data.token)
    localStorage.setItem('swapfx_usuario', JSON.stringify(usuario.value))
    return data
  }

  async function registro(datos) {
    const res = await api.post('/api/usuario/signup', datos)
    return res.data
  }

  function logout() {
    token.value = ''
    usuario.value = null
    localStorage.removeItem('swapfx_token')
    localStorage.removeItem('swapfx_usuario')
  }

  return { usuario, token, estaLogueado, esAdmin, nombreCompleto, login, registro, logout }
})

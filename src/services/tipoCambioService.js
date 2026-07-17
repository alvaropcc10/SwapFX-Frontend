import axios from 'axios'

const BASE = 'https://api.frankfurter.app'

export async function obtenerTipoCambio(desde, hasta) {
  try {
    const res = await axios.get(`${BASE}/latest?from=${desde}&to=${hasta}`)
    return res.data.rates[hasta]
  } catch {
    const fallbacks = {
      'USD-PEN': 3.72, 'PEN-USD': 0.269,
      'EUR-PEN': 4.05, 'PEN-EUR': 0.247,
      'USD-EUR': 0.92, 'EUR-USD': 1.087,
    }
    return fallbacks[`${desde}-${hasta}`] ?? null
  }
}

export async function obtenerTodosLosTipos() {
  try {
    const [usdPen, eurPen, usdEur] = await Promise.all([
      obtenerTipoCambio('USD', 'PEN'),
      obtenerTipoCambio('EUR', 'PEN'),
      obtenerTipoCambio('USD', 'EUR'),
    ])
    return { usdPen, eurPen, usdEur }
  } catch (e) {
    console.error('error tipo cambio', e)
    return { usdPen: 3.72, eurPen: 4.05, usdEur: 0.92 }
  }
}

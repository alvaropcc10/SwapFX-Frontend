import axios from 'axios'

const BASE = 'https://api.frankfurter.app'

export async function obtenerTipoCambio(desde, hasta) {
  const res = await axios.get(`${BASE}/latest?from=${desde}&to=${hasta}`)
  return res.data.rates[hasta]
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

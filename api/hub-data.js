// Vercel Serverless Function — agrega dados reais de todos os apps

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')

  const [cfg, tcuFgts, tcuMcmv] = await Promise.allSettled([
    fetchCfg(),
    fetchTcuCount('https://tcu-fgts.vercel.app/'),
    fetchTcuCount('https://tcu-mcmv-fgts.vercel.app/'),
  ])

  const tripDate = new Date('2026-06-27')
  const diasParaJapao = Math.max(0, Math.ceil((tripDate - new Date()) / 86400000))

  res.json({
    geradoEm:  new Date().toISOString(),
    cfg:       cfg.status     === 'fulfilled' ? cfg.value     : null,
    tcuFgts:   tcuFgts.status === 'fulfilled' ? tcuFgts.value : null,
    tcuMcmv:   tcuMcmv.status === 'fulfilled' ? tcuMcmv.value : null,
    japao:     { diasRestantes: diasParaJapao, dataPartida: '27/06/2026' },
    instantes: { totalFotos: 3485, albuns: 44 },
  })
}

async function fetchCfg() {
  const r = await fetch('https://cfg-app.vercel.app/api/diagnostico')
  const d = await r.json()
  const totalRespondidas = d.stats.reduce((s, m) => s + m.totalRespondidas, 0)
  const modulos = d.stats.map(m => ({
    codigo: m.modulo, acerto: Math.round(m.acertoPct * 100), status: m.status,
  }))
  const melhorModulo = [...modulos].filter(m => m.acerto > 0).sort((a,b) => b.acerto - a.acerto)[0]
  return {
    streakDias: d.streakDias,
    totalRespondidas,
    melhorModulo,
    modulosCriticos: modulos.filter(m => m.status === 'Vermelho').length,
    totalModulos: modulos.length,
  }
}

async function fetchTcuCount(url) {
  const r = await fetch(url)
  const html = await r.text()
  const match = html.match(/(\d+)\s*acórdãos/)
  return { total: match ? parseInt(match[1]) : null }
}

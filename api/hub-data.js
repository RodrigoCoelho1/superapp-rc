// Vercel Serverless Function — agrega dados reais de todos os apps

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')

  const [tcuFgts] = await Promise.allSettled([
    fetchTcuCount('https://rc-tcu.vercel.app/'),
  ])

  const tripDate = new Date('2026-06-27')
  const diasParaJapao = Math.max(0, Math.ceil((tripDate - new Date()) / 86400000))

  res.json({
    geradoEm:  new Date().toISOString(),
    tcuFgts:   tcuFgts.status === 'fulfilled' ? tcuFgts.value : null,
    japao:     { diasRestantes: diasParaJapao, dataPartida: '27/06/2026' },
    instantes: { totalFotos: 3485, albuns: 44 },
  })
}

async function fetchTcuCount(url) {
  const r = await fetch(url)
  const html = await r.text()
  const match = html.match(/(\d+)\s*acórdãos/)
  return { total: match ? parseInt(match[1]) : null }
}

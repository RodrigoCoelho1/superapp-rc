import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { request } from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TOKEN = 'vca_3KkjJnpxsotoFgyoayBw0jCEJe3BmpDOstGCVq7U1XvJeSUJNJ4f0mrF'
const TEAM  = 'team_NX0pJs3QfWHWXrPVYaQEBaPp'

const arquivos = [
  'index.html', 'manifest.json', 'sw.js',
  'icon-192.png', 'icon-512.png', 'api/hub-data.js'
]

const payload = JSON.stringify({
  name: 'hub-rc',
  files: arquivos.map(f => ({
    file: f,
    data: readFileSync(join(__dirname, f)).toString('base64'),
    encoding: 'base64'
  })),
  projectSettings: { framework: null },
  target: 'production'
})

console.log('Enviando', arquivos.length, 'arquivos...')

const opts = {
  hostname: 'api.vercel.com',
  path: `/v13/deployments?teamId=${TEAM}`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}

const req = request(opts, res => {
  let body = ''
  res.on('data', d => body += d)
  res.on('end', () => {
    const r = JSON.parse(body)
    if (r.url) {
      console.log('✅ Deploy OK:', 'https://' + r.url)
      console.log('   Alias: https://hub-rc.vercel.app')
    } else {
      console.log('❌ Erro:', r.error?.message || JSON.stringify(r).substring(0, 300))
    }
  })
})

req.on('error', e => console.error('Erro de rede:', e.message))
req.write(payload)
req.end()

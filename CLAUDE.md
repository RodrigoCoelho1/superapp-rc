# SuperApp Hub — Rodrigo Coelho

## O que é este projeto

Hub central PWA que concentra todos os apps criados pelo Rodrigo com Claude.
Acessível no browser e no celular (instalável como app).

**URL de produção:** https://rc-superapp.vercel.app

## Arquivos

- `index.html` — app principal (hub + shell de navegação)
- `manifest.json` — configuração PWA (ícone, nome, tema)
- `iniciar-todos.bat` — sobe todos os apps locais de uma vez

## Apps cadastrados

| App | URL | Stack |
|-----|-----|-------|
| RC | https://rc-financas.vercel.app/ | HTML estático + PWA / Vercel |
| Casal RC | https://casal-rc.vercel.app/ | HTML estático + PWA / Vercel |
| CFG App | https://rc-cfg.vercel.app/ | Next.js / Vercel |
| Fatura XP | https://rc-cartao.vercel.app/ | Next.js / Vercel |
| Semanada | https://rc-semanada.vercel.app/ | Vite / Vercel |
| Japão 2026 | https://rc-japao.vercel.app/ | Vite / Vercel |
| News Radar | https://rc-news-app.vercel.app/ | Next.js / Vercel |
| RC News | https://rc-cockpit-app.vercel.app/ | Next.js / Vercel |
| GTD | https://gtd-app-liart.vercel.app/inbox | Next.js / Vercel |
| Instantes | https://instantes-rc.netlify.app/ | PWA / Netlify |
| Acervo TCU — FI-FGTS | https://rc-tcu.vercel.app/ | Python FastAPI / Vercel |
| Acervo TCU — MCMV×FGTS | https://tcu-mcmv-fgts.vercel.app/ | Python FastAPI / Vercel |
| Star Wars | https://rc-starwars.vercel.app/ | Next.js / Vercel |

**RC** consome dados do **Fatura XP** via `data/cartao.json` (atualizado pelo script `scripts/sync-cartao.mjs` no projeto RC).

## Como adicionar um novo app

1. Abrir `index.html`
2. Copiar um bloco `<a class="app">` existente do `.app-grid`
3. Atualizar: emoji, nome, sub, `data-cat`, `data-tags`, URL no `href`
4. (Opcional) Adicionar dado vivo via `id="x-..."` e atualizar `loadData()`
5. Bumpar `CACHE` em `sw.js` (ex: `hub-v19` → `hub-v20`)
6. Deploy: `npx vercel --prod --yes` + re-alias para `superapp-rc.vercel.app`

## Problema pendente: iframe bloqueado

Todos os apps bloqueiam iframe via `X-Frame-Options`.
Opções a resolver:
- **A:** Adicionar header `Content-Security-Policy: frame-ancestors https://rc-superapp.vercel.app` em cada app
- **B:** Mudar para navegação por `window.location` (back nativo do browser)

## Deploy

```bash
cd "C:\Users\rodri\OneDrive\Documentos\Claude\Projects\SuperApp"
vercel --prod --yes
```

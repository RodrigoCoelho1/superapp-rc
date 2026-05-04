@echo off
title Hub — Iniciar Todos os Apps
color 0B
echo.
echo  ============================================================
echo    HUB - RODRIGO COELHO
echo    Iniciando todos os apps locais...
echo  ============================================================
echo.

set BASE=C:\Users\rodri\OneDrive\Documentos\Claude\Projects

:: ── CFG App (Next.js :3000) ──────────────────────────────────
echo  [1/4] CFG App           → http://localhost:3000
start "CFG App :3000" cmd /k "cd /d "%BASE%\CFG\cfg-app" && set DATABASE_URL=file:./cfg.db && npm run dev"

:: ── Fatura XP (Next.js :3001) ────────────────────────────────
echo  [2/4] Fatura XP         → http://localhost:3001
start "Fatura XP :3001" cmd /k "cd /d "%BASE%\Cartão de Crédito\fatura-xp" && npm run dev -- -p 3001"

:: ── News Radar (Next.js :3002) ───────────────────────────────
echo  [3/4] News Radar        → http://localhost:3002
start "News Radar :3002" cmd /k "cd /d "%BASE%\News" && npm run dev -- -p 3002"

:: ── Japão 2026 (Vite :5173) ──────────────────────────────────
echo  [4/5] Japão 2026        → http://localhost:5173
start "Japão 2026 :5173" cmd /k "cd /d "%BASE%\Japão" && npm run dev -- --host --port 5173"

:: ── Hub (npx serve :4000) ─────────────────────────────────────
echo  [5/5] Hub               → http://localhost:4000
start "Hub :4000" cmd /k "cd /d "%BASE%\SuperApp" && npx serve -l 4000"

echo.
echo  ============================================================
echo    Aguarde ~10s para os servidores subirem, depois abra:
echo.
echo    Hub: http://localhost:4000
echo.
echo    No celular (mesma rede Wi-Fi), descubra o IP com:
echo      ipconfig ^| findstr IPv4
echo    E acesse:  http://SEU-IP:4000
echo  ============================================================
echo.

:: Abre o Hub no browser após 10 segundos
timeout /t 10 /nobreak >nul
start "" "http://localhost:4000"

echo  Pressione qualquer tecla para fechar esta janela.
echo  (Os apps continuam rodando nas outras janelas.)
pause >nul

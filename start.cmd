@echo off
REM caminho base do projeto
set "ROOT=..\chat-viewer"

REM Abre Windows Terminal com 3 abas:
REM 1) frontend: npm run dev
REM 2) backend: cd server && npm run dev
REM 3) nginx: nginx.exe

wt ^
  new-tab -p "Command Prompt" -d "%ROOT%" --title "Front"  cmd /k "npm run dev" ^; ^
  new-tab -p "Command Prompt" -d "%ROOT%\server" --title "Server" cmd /k "npm run dev" ^; ^
  new-tab -p "Command Prompt" -d "%ROOT%\nginx-1.28.0" --title "Caller" cmd /k "nginx.exe"

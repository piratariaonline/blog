@echo off
REM ---------------------------------------------------------------
REM  carta na garrafa — editor launcher
REM  Double-click (or run from a desktop shortcut) to start both the
REM  server and the Vite client, then open the editor in your browser.
REM ---------------------------------------------------------------

setlocal

REM Always run from the folder this .bat lives in, no matter where it
REM was invoked from (a desktop shortcut sets a different cwd).
cd /d "%~dp0"

title carta na garrafa - editor

echo.
echo  === carta na garrafa - editor ===
echo  repo:   %~dp0..
echo  server: http://localhost:4455
echo  client: http://localhost:5173
echo.
echo  Press Ctrl+C twice to stop.
echo.

REM Open the editor in the default browser after a short delay so Vite
REM has time to bind the port. Runs in parallel; harmless if it loses.
start "" /min cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:5173"

REM Run the dev script in this window so logs are visible and Ctrl+C
REM cleanly stops both processes via concurrently.
call npm run dev

endlocal

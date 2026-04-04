@echo off
setlocal enabledelayedexpansion

set ports=8080 3000 3001 3002 3003 3004 3005

for %%p in (%ports%) do (
    echo Checking port %%p...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        echo Found process PID %%a on port %%p. Killing...
        taskkill /F /PID %%a
    )
)

echo All targeted ports have been cleared.
pause

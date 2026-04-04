# Ultra-aggressive script to kill processes on common ports for the Men's Fashion Store project
# Uses netstat and taskkill /F for guaranteed termination

$ports = @(8080, 3000, 3001, 3002, 3003, 3004, 3005)

foreach ($port in $ports) {
    Write-Host "Checking port $port..." -ForegroundColor Cyan
    
    # Get all PIDs listening on the port
    $pids = netstat -ano | Select-String ":$port\s+.*\s+LISTENING" | ForEach-Object {
        if ($_ -match '(\d+)$') { $matches[1] }
    } | Select-Object -Unique

    if ($pids) {
        foreach ($pid in $pids) {
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                $pName = if ($process) { $process.Name } else { "Unknown" }
                
                Write-Host "Found process '$pName' (PID: $pid) on port $port. Force-killing..." -ForegroundColor Yellow
                
                # Use taskkill /F /T for a full recursive termination
                taskkill /F /T /PID $pid 2>$null
                
                # Fallback to Stop-Process just in case
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue 2>$null
                
                Write-Host "Killed process $pid on port $port." -ForegroundColor Green
            } catch {
                Write-Host "Could not kill PID $pid. If it is a system process (like PID 4/28), you might need manual intervention." -ForegroundColor Red
            }
        }
        # Small delay to ensure the OS releases the port
        Start-Sleep -Milliseconds 500
    } else {
        Write-Host "Port $port is already free." -ForegroundColor Gray
    }
}

Write-Host "`nAll targeted ports have been cleared. You can now restart your application." -ForegroundColor Green

$port = 3000
if ($args.Count -gt 0) { $port = $args[0] }

Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object {
    $pid = $_.OwningProcess
    try {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Killing PID $pid ($($process.Name)) on port $port..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    } catch {}
}

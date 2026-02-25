# 任务管理系统开机启动
$exePath = "C:\Users\Administrator\clawd\task-management\server.js"
$workDir = "C:\Users\Administrator\clawd\task-management"
$port = 8083

# 检查是否已运行
$running = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if (-not $running) {
    Start-Process node -ArgumentList $exePath -WorkingDirectory $workDir -WindowStyle Hidden
    Write-Host "任务管理系统已启动: http://localhost:$port"
} else {
    Write-Host "任务管理系统已在运行: http://localhost:$port"
}

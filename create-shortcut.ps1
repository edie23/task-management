$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\task-management.lnk")
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -WindowStyle Hidden -File C:\Users\Administrator\clawd\task-management\startup.ps1"
$Shortcut.WorkingDirectory = "C:\Users\Administrator\clawd\task-management"
$Shortcut.Save()

<#
  Creates desktop and Start-menu shortcuts (with their own icons) for the four apps.
  Run again any time; it overwrites the shortcuts. Usage: powershell -File create-shortcuts.ps1
#>
$ErrorActionPreference = 'Stop'
$launch = Join-Path $PSScriptRoot 'launch.ps1'
$icons = Join-Path $PSScriptRoot 'icons'
$desktop = [Environment]::GetFolderPath('Desktop')
$startMenu = Join-Path ([Environment]::GetFolderPath('Programs')) 'SAEO'
New-Item -ItemType Directory -Force $startMenu | Out-Null

$apps = @(
  @{ Key = 'academy';   Name = 'Engineering Academy'; Desc = 'SAEO Engineering Academy - 학습 앱' },
  @{ Key = 'office';    Name = "Owner's Office";      Desc = "SAEO Owner's Office - 현금·경영" },
  @{ Key = 'lingua';    Name = 'Lingua Space';        Desc = 'Lingua Space - 언어 학습' },
  @{ Key = 'expansion'; Name = 'The Expansion';       Desc = 'The Expansion - 지식 백과' }
)

$shell = New-Object -ComObject WScript.Shell
foreach ($app in $apps) {
  foreach ($folder in @($desktop, $startMenu)) {
    $path = Join-Path $folder "$($app.Name).lnk"
    $lnk = $shell.CreateShortcut($path)
    $lnk.TargetPath = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
    $lnk.Arguments = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$launch`" -App $($app.Key)"
    $lnk.WorkingDirectory = $PSScriptRoot
    $lnk.IconLocation = (Join-Path $icons "$($app.Key).ico") + ',0'
    $lnk.Description = $app.Desc
    $lnk.WindowStyle = 7
    $lnk.Save()
  }
  Write-Output "shortcut: $($app.Name)"
}
Write-Output "Desktop: $desktop"
Write-Output "Start menu: $startMenu"

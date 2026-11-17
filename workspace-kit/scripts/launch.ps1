<#
  Opens one SAEO app in its own window.
  1. If the app's server is not running, starts it hidden (logs in scripts\logs).
  2. Waits until the port answers.
  3. Opens Microsoft Edge (or Chrome) in app mode: its own window, no tabs or address bar.

  Usage: powershell -File launch.ps1 -App academy|office|expansion|lingua
#>
param([Parameter(Mandatory = $true)][ValidateSet('academy', 'office', 'expansion', 'lingua')] [string]$App)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$logs = Join-Path $PSScriptRoot 'logs'
New-Item -ItemType Directory -Force $logs | Out-Null

$apps = @{
  academy   = @{ Dir = 'engineering-academy'; Port = 4310; Wait = 30;  Url = 'http://localhost:4310/#/curriculum' }
  office    = @{ Dir = 'owners-office';       Port = 4320; Wait = 30;  Url = 'http://localhost:4320/#/cash' }
  expansion = @{ Dir = 'the-expansion';       Port = 4321; Wait = 120; Url = 'http://localhost:4321/' }
  lingua    = @{ Dir = 'LiguaSpace';          Port = 8081; Wait = 180; Url = 'http://localhost:8081/' }
}
$a = $apps[$App]
$dir = Join-Path $root $a.Dir

function Test-Port([int]$port) {
  $client = New-Object System.Net.Sockets.TcpClient
  try { $client.Connect('127.0.0.1', $port); return $true } catch { return $false } finally { $client.Dispose() }
}

if (-not (Test-Port $a.Port)) {
  $out = Join-Path $logs "$App.log"
  $err = Join-Path $logs "$App.err.log"
  switch ($App) {
    { $_ -in 'academy', 'office' } {
      Start-Process -FilePath 'node' -ArgumentList '--disable-warning=ExperimentalWarning', 'server/index.js' -WorkingDirectory $dir -WindowStyle Hidden -RedirectStandardOutput $out -RedirectStandardError $err
    }
    'expansion' {
      if (-not (Test-Path (Join-Path $dir 'node_modules'))) { Start-Process -FilePath 'npm.cmd' -ArgumentList 'ci' -WorkingDirectory $dir -WindowStyle Hidden -Wait }
      if (-not (Test-Path (Join-Path $dir 'dist'))) { Start-Process -FilePath 'npm.cmd' -ArgumentList 'run', 'build' -WorkingDirectory $dir -WindowStyle Hidden -Wait }
      Start-Process -FilePath 'npm.cmd' -ArgumentList 'run', 'preview', '--', '--port', '4321', '--host', '127.0.0.1' -WorkingDirectory $dir -WindowStyle Hidden -RedirectStandardOutput $out -RedirectStandardError $err
    }
    'lingua' {
      # Local mode: an H2 file database instead of the PostgreSQL used on Render.
      $env:DATABASE_URL = 'jdbc:h2:file:./data/lingua-local;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE'
      $env:DATABASE_USERNAME = 'sa'
      $env:DATABASE_PASSWORD = ''
      $env:PORT = '8081'
      Start-Process -FilePath (Join-Path $dir 'gradlew.bat') -ArgumentList 'bootRun' -WorkingDirectory $dir -WindowStyle Hidden -RedirectStandardOutput $out -RedirectStandardError $err
    }
  }
  $deadline = (Get-Date).AddSeconds($a.Wait)
  while (-not (Test-Port $a.Port)) {
    if ((Get-Date) -gt $deadline) {
      Add-Type -AssemblyName PresentationFramework
      [System.Windows.MessageBox]::Show("$App 서버가 $($a.Wait)초 안에 시작되지 않았습니다.`n로그: $out", 'SAEO') | Out-Null
      exit 1
    }
    Start-Sleep -Milliseconds 500
  }
}

$browsers = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
) | Where-Object { $_ -and (Test-Path $_) }

if ($browsers) {
  Start-Process -FilePath $browsers[0] -ArgumentList "--app=$($a.Url)", '--new-window'
} else {
  Start-Process $a.Url
}

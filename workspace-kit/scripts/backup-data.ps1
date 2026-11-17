<#
  Backs up everything Git does NOT hold to OneDrive (or -Target):
  app databases, local settings with passwords, AI instructions, and these scripts.
  Code is backed up by pushing to GitHub; this covers the rest.

  Usage: powershell -File backup-data.ps1 [-Target D:\backup]
  Weekly automatic run (optional, once):
    schtasks /Create /SC WEEKLY /D FRI /ST 21:00 /TN "SAEO backup" /TR "powershell -NoProfile -ExecutionPolicy Bypass -File \"<this file>\""
#>
param([string]$Target = (Join-Path $env:OneDrive 'SAEO-backup'))

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$stamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
$dest = Join-Path $Target $stamp
New-Item -ItemType Directory -Force $dest | Out-Null

$registry = Get-Content (Join-Path $root 'workspace.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$copied = 0
$skipped = @()
foreach ($p in $registry.projects) {
  foreach ($item in $p.data) {
    if ($item -like 'mysql:*') { continue }
    $src = Join-Path (Join-Path $root $p.folder) $item
    $files = @()
    if (Test-Path $src -PathType Container) { $files = Get-ChildItem $src -File -Recurse }
    else { $files = Get-ChildItem "$src*" -File -ErrorAction SilentlyContinue }   # db + -wal + -shm
    foreach ($f in $files) {
      $rel = $f.FullName.Substring($root.Length + 1)
      $to = Join-Path $dest $rel
      New-Item -ItemType Directory -Force (Split-Path $to) | Out-Null
      try { Copy-Item $f.FullName $to -Force -ErrorAction Stop; $copied++ }
      catch { $skipped += $rel }
    }
  }
}

# Local settings that hold passwords (never in Git)
Get-ChildItem $root -Recurse -File -Include 'application-local.properties', '.env' -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch '\\node_modules\\|\\build\\' } | ForEach-Object {
    $to = Join-Path $dest $_.FullName.Substring($root.Length + 1)
    New-Item -ItemType Directory -Force (Split-Path $to) | Out-Null
    Copy-Item $_.FullName $to -Force
    $copied++
  }

# Workspace instructions and scripts, so a new laptop can start from this folder alone
Copy-Item (Join-Path $root 'workspace.json'), (Join-Path $root 'CLAUDE.md') $dest -Force
Copy-Item $PSScriptRoot (Join-Path $dest 'SAEO-WORKSPACE-scripts') -Recurse -Force
$claude = Join-Path $HOME '.claude\CLAUDE.md'
if (Test-Path $claude) { Copy-Item $claude (Join-Path $dest 'global-CLAUDE.md') -Force }

# Installed programs list (for winget import on the new laptop)
try { winget export -o (Join-Path $dest 'apps.json') --accept-source-agreements | Out-Null } catch { }

# MySQL databases (Focus Flow, Radar) if mysqldump and credentials are available
$mysqldump = Get-Command mysqldump -ErrorAction SilentlyContinue
if ($mysqldump -and $env:DB_PASSWORD) {
  $user = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { 'root' }
  foreach ($db in 'focus_flow', 'global_tech_radar') {
    & $mysqldump.Source -u $user "-p$env:DB_PASSWORD" --databases $db --result-file (Join-Path $dest "$db.sql") 2>$null
  }
} else {
  Set-Content (Join-Path $dest 'MYSQL-NOT-BACKED-UP.txt') 'Set DB_USERNAME and DB_PASSWORD and make sure mysqldump is on PATH to include MySQL databases.' -Encoding UTF8
}

Write-Output "Backed up $copied data files to $dest"
if ($skipped.Count) {
  Write-Output "Skipped (in use by a running app; close it and run again):"
  $skipped | ForEach-Object { Write-Output "  $_" }
}

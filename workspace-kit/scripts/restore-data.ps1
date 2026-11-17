<#
  New laptop: copies the newest backup made by backup-data.ps1 back into the workspace.
  Stop the apps first (close their windows and servers).
  Usage: powershell -File restore-data.ps1 [-Source <backup folder>]
#>
param([string]$Source = '')

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $Source) {
  $base = Join-Path $env:OneDrive 'SAEO-backup'
  $Source = (Get-ChildItem $base -Directory | Where-Object { $_.Name -match '^\d{4}-' } | Sort-Object Name -Descending | Select-Object -First 1).FullName
}
if (-not $Source -or -not (Test-Path $Source)) { throw "No backup found. Pass -Source <folder>." }
Write-Output "Restoring from $Source"

$skip = @('SAEO-WORKSPACE-scripts', 'apps.json', 'global-CLAUDE.md', 'MYSQL-NOT-BACKED-UP.txt')
Get-ChildItem $Source -Recurse -File | Where-Object {
  $rel = $_.FullName.Substring($Source.Length + 1)
  -not ($skip | Where-Object { $rel -eq $_ -or $rel.StartsWith("$_\") }) -and $rel -notmatch '\.sql$'
} | ForEach-Object {
  $rel = $_.FullName.Substring($Source.Length + 1)
  $to = Join-Path $root $rel
  New-Item -ItemType Directory -Force (Split-Path $to) | Out-Null
  Copy-Item $_.FullName $to -Force
  Write-Output "  $rel"
}

$claudeDir = Join-Path $HOME '.claude'
New-Item -ItemType Directory -Force $claudeDir | Out-Null
if (Test-Path (Join-Path $Source 'global-CLAUDE.md')) { Copy-Item (Join-Path $Source 'global-CLAUDE.md') (Join-Path $claudeDir 'CLAUDE.md') -Force }

$sql = Get-ChildItem $Source -Filter *.sql
if ($sql) { Write-Output "MySQL dumps to import manually: mysql -u root -p < <file>"; $sql | ForEach-Object { Write-Output "  $($_.FullName)" } }
Write-Output 'Done.'

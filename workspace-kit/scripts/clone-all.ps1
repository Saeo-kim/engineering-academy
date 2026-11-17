<#
  New laptop: clones every repository in workspace.json into Desktop\SAEO-WORKSPACE over SSH.
  Already-cloned folders are pulled instead. Requires Git and an SSH key added to GitHub (Saeo-kim).
  Usage: powershell -File clone-all.ps1 [-Root C:\Users\me\Desktop\SAEO-WORKSPACE]
#>
param([string]$Root = (Join-Path ([Environment]::GetFolderPath('Desktop')) 'SAEO-WORKSPACE'))

$ErrorActionPreference = 'Continue'
$registryPath = Join-Path $PSScriptRoot '..\workspace.json'
if (-not (Test-Path $registryPath)) { $registryPath = Join-Path $PSScriptRoot '..\..\workspace.json' }
if (-not (Test-Path $registryPath)) { $registryPath = Join-Path (Split-Path $PSScriptRoot) 'workspace.json' }
$registry = Get-Content $registryPath -Raw -Encoding UTF8 | ConvertFrom-Json
New-Item -ItemType Directory -Force $Root | Out-Null

foreach ($p in $registry.projects) {
  $dir = Join-Path $Root $p.folder
  $url = $registry.owner.remote.Replace('{repo}', $p.repo)
  if (Test-Path (Join-Path $dir '.git')) {
    Write-Output "pull  $($p.folder)"
    git -C $dir pull --ff-only
  } else {
    Write-Output "clone $($p.folder)"
    git clone $url $dir
  }
}
Copy-Item $registryPath (Join-Path $Root 'workspace.json') -Force -ErrorAction SilentlyContinue
Write-Output "Done. Next: powershell -File restore-data.ps1, then create-shortcuts.ps1"

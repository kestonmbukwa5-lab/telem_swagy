param(
  [Parameter(Mandatory=$true)]
  [string]$RemoteUrl
)

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git is not installed on this machine."
  exit 1
}

Write-Host "Adding remote origin: $RemoteUrl"
git remote add origin $RemoteUrl

git branch -M main

Write-Host "Pushing to remote..."
git push -u origin main

Write-Host "Done."
Write-Host "To publish with GitHub Pages, enable Pages from the repository settings using branch 'main' and root folder '/'."
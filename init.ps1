# init.ps1 - Windows verification entrypoint for this harness.
#
# Mirrors ./init.sh. Both run the same Node verification suite.
# Fails fast: any failing check aborts with a non-zero exit code.

$ErrorActionPreference = 'Stop'

Write-Host '=== Makongi FC prototype verification ==='

& node .\scripts\verify.mjs
if ($LASTEXITCODE -ne 0) {
    throw "Verification failed with exit code $LASTEXITCODE"
}

Write-Host ''
Write-Host '=== Verification Complete ==='
Write-Host 'The app data, required artifacts, routes and HTTP entrypoints are healthy.'

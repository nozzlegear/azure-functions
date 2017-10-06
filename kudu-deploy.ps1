./.paket/paket.exe restore --force

if ($LASTEXITCODE -ne 0) {
    Write-Error "Error restoring paket files. Exit code: $LASTEXITCODE"

    exit $LASTEXITCODE
}
# start-dev.ps1
# Skrip PowerShell untuk memulai frontend dan backend

# Fungsi untuk mengecek apakah direktori ada
function Check-Directory {
    param (
        [string]$Path
    )
    if (-Not (Test-Path $Path)) {
        Write-Host "Direktori $Path tidak ditemukan."
        exit
    }
}

# Direktori Frontend dan Backend
$frontendDir = Join-Path $PSScriptRoot "fronted"
$backendDir = Join-Path $PSScriptRoot "backend"

# Cek keberadaan direktori
Check-Directory -Path $frontedDir
Check-Directory -Path $backendDir

# Jalankan Backend
Write-Host "Menjalankan Backend..."
Start-Process "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; npm run dev" -WindowStyle Normal

# Jalankan Frontend
Write-Host "Menjalankan Frontend..."
Start-Process "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$frontedDir'; npm start" -WindowStyle Normal

Write-Host "Frontend dan Backend telah dijalankan."

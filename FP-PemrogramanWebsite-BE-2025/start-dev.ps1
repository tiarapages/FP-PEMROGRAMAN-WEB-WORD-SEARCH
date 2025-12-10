# Start backend in development mode
Set-Location "C:\Users\lenovo\Downloads\PEMWEB\FP-PemrogramanWebsite-BE-2025"

$env:DATABASE_URL = "postgresql://wordit_user:password123@localhost:5432/wordit_db?schema=public"
$env:JWT_ACCESS_SECRET = "your-secret-key"
$env:PORT = "4000"
$env:HOST = "localhost"
$env:BASE_URL = "http://localhost:4000"
$env:NODE_ENV = "development"

Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Cyan

bun --watch src/main.ts

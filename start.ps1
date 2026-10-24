# Start DPDP_Secure - PowerShell version
# Run this from the repository root directory

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "DPDP_Secure - Startup Script" -ForegroundColor Cyan
Write-Host "Srujana Tech Fest 2026 | LS-04" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Kill any existing processes on our ports
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.Modules -like "*uvicorn*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Start Backend
Write-Host "[1/2] Starting FastAPI backend on http://127.0.0.1:8000" -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-Command `"`"cd backend; pip install -r requirements.txt -q; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`"`"" -WindowStyle Hidden

# Wait for backend
Start-Sleep -Seconds 4

# Start Frontend
Write-Host "[2/2] Starting React frontend on http://localhost:5173" -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-Command `"`"cd frontend; npm install -q; npm run dev`"`"" -WindowStyle Hidden

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Both servers started!" -ForegroundColor Green
Write-Host "Backend:  http://127.0.0.1:8000/docs (Swagger UI)" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop this script" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Cyan

while ($true) { Start-Sleep -Seconds 10 }

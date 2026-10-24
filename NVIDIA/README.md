# DPDPA for Small Business - NVIDIA

This folder contains the complete LS-04 (Personal Data in Informal Systems) solution for Srujana Tech Fest 2026.

## Structure

```
NVIDIA/
├── backend/           # FastAPI backend (Python 3.11+)
├── frontend/          # React 18+ frontend (Vite + Tailwind)
├── data/              # Sample SME datasets
├── start.ps1          # Windows startup script
├── start.sh           # Linux/Mac startup script
├── README.md          # Project overview
└── IMPLEMENTATION_PLAN.md  # 48-hour execution plan
```

## Quick Start

### Windows PowerShell
```powershell
cd N:\chnayka\NVIDIA
.\start.ps1
```

### Linux/Mac (Git Bash)
```bash
cd N:/chnayka/NVIDIA
./start.sh
```

## Access

- Frontend: http://localhost:5550
- Backend API: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/api/health

## Tech Stack

- Backend: FastAPI, SQLite, openpyxl
- Frontend: React 18, Vite, Tailwind CSS
- Offline-first: Zero cloud dependencies

import os
import sys
import webbrowser
import time
from pathlib import Path
import uvicorn

def main():
    root_dir = Path(__file__).resolve().parent
    backend_dir = root_dir / "backend"
    
    # Ensure current working directory is backend for relative paths
    os.chdir(backend_dir)
    sys.path.insert(0, str(backend_dir))

    print("==================================================================")
    print(" DPDPA FOR SMALL BUSINESS (SRUJANA 2026 - PROBLEM LS-04)")
    print(" Offline-First Data Protection Compliance Prototype")
    print("==================================================================")
    print(" [*] Mode: 100% Offline-First Local Compute (No Cloud, Zero Leaks)")
    print(" [*] Host: http://localhost:8000")
    print(" [*] Swagger Docs: http://localhost:8000/docs")
    print("==================================================================")
    import socket
    import subprocess

    def free_port_if_in_use(port=8000):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) == 0:
                print(f" [*] Port {port} is occupied. Clearing stale process...")
                try:
                    res = subprocess.run(["netstat", "-ano"], capture_output=True, text=True)
                    for line in res.stdout.splitlines():
                        if f":{port}" in line and "LISTENING" in line:
                            parts = line.strip().split()
                            pid = parts[-1]
                            if pid.isdigit() and int(pid) != os.getpid():
                                subprocess.run(["taskkill", "/F", "/PID", pid], capture_output=True)
                                time.sleep(1)
                except Exception:
                    pass

    free_port_if_in_use(8000)
    # Delay opening browser slightly until server is listening
    def open_browser():
        time.sleep(1.5)
        webbrowser.open("http://localhost:8000")

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    # Start FastAPI / Uvicorn server
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False, log_level="info")

if __name__ == "__main__":
    main()

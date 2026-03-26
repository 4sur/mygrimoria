import subprocess
import time

proc = subprocess.Popen(
    ["python", "main.py"],
    cwd="C:\\Users\\Pan\\Desktop\\mygrimoria\\backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)
print(f"Started backend with PID: {proc.pid}")

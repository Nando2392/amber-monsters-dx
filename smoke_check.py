# -*- coding: utf-8 -*-
"""Smoke check determinista para Amber Monsters DX (app web Vite).

Verifica que la app de produccion compila y se sirve de verdad:
  1. `npm run build` debe terminar con codigo 0.
  2. `vite preview` (build servido) debe responder HTTP 200 en /.
  3. El HTML debe contener el canvas del juego.
  4. El asset JS principal del bundle debe servirse (200, no vacio).

No depende de PIL ni de ninguna dependencia externa: solo stdlib.
Exit code 0 = pasa. Cualquier fallo = exit code 1 (bloquea el gate).
"""
import os
import re
import subprocess
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
PREVIEW_PORT = 4173
PREVIEW_URL = f"http://127.0.0.1:{PREVIEW_PORT}/"


def log(msg):
    print(msg, flush=True)


def build():
    log("==> npm run build")
    p = subprocess.run(
        ["npm", "run", "build"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        shell=True,  # npm es npm.cmd en Windows
        timeout=100,
    )
    if p.returncode != 0:
        log("BUILD FAILED")
        log(p.stdout[-3000:])
        log(p.stderr[-3000:])
        return False
    log("BUILD OK")
    return True


def serve_and_probe():
    log("==> vite preview")
    srv = subprocess.Popen(
        ["node", os.path.join("node_modules", "vite", "bin", "vite.js"),
         "preview", "--port", str(PREVIEW_PORT), "--host", "127.0.0.1", "--strictPort"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        html = None
        deadline = time.time() + 30
        while time.time() < deadline:
            try:
                with urllib.request.urlopen(PREVIEW_URL, timeout=3) as r:
                    if r.status == 200:
                        html = r.read().decode("utf-8", "replace")
                        break
            except Exception:
                time.sleep(0.5)
        if html is None:
            log("PREVIEW NOT READY")
            return False

        if 'id="game"' not in html or "<canvas" not in html:
            log("HTML MISSING CANVAS")
            return False

        # asset JS principal del bundle
        m = re.search(r'<script type="module"[^>]+src="([^"]+\.js)"', html)
        if not m:
            log("BUNDLE SCRIPT NOT FOUND IN HTML")
            return False
        asset = m.group(1)
        with urllib.request.urlopen(PREVIEW_URL + asset.lstrip("/"), timeout=10) as r:
            body = r.read()
            if r.status != 200 or len(body) < 5000:
                log(f"BUNDLE TOO SMALL/ERR: status={r.status} bytes={len(body)}")
                return False
        log(f"BUNDLE OK ({len(body)} bytes)")
        log("PREVIEW OK")
        return True
    finally:
        srv.terminate()
        try:
            srv.wait(timeout=5)
        except Exception:
            srv.kill()


def main():
    if not build():
        sys.exit(1)
    if not serve_and_probe():
        sys.exit(1)
    log("SMOKE CHECK PASSED")
    sys.exit(0)


if __name__ == "__main__":
    main()

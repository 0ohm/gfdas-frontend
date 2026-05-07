"""
borrar/convert_logo.py
Convierte logo.png a logo.webp y elimina el PNG original.
BORRAR ESTE ARCHIVO DESPUES DE EJECUTARLO.
"""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("[ERROR] Pillow no esta instalado. Instalando...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

LOGO_DIR = Path(__file__).resolve().parent.parent / "public"
PNG_PATH = LOGO_DIR / "logo.png"
WEBP_PATH = LOGO_DIR / "logo.webp"

def main():
    if not PNG_PATH.exists():
        print(f"[ERROR] No se encontro {PNG_PATH}")
        sys.exit(1)

    print(f"[INFO] Abriendo {PNG_PATH} ...")
    img = Image.open(PNG_PATH)
    print(f"[INFO] Formato: {img.format}, Tamano: {img.size}, Modo: {img.mode}")

    img.save(WEBP_PATH, "WEBP", quality=90, method=6)
    print(f"[OK] Guardado como {WEBP_PATH} ({WEBP_PATH.stat().st_size / 1024:.1f} KB)")

    PNG_PATH.unlink()
    print(f"[OK] Eliminado {PNG_PATH}")
    print("[LISTO] Conversion completada.")

if __name__ == "__main__":
    main()

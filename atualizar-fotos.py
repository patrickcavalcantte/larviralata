"""Atualiza a galeria: rode depois de colocar fotos novas na pasta "fotos".

  python atualizar-fotos.py

- cria as versões leves em fotos/web e fotos/web/mini (só das que faltam)
- reescreve js/fotos.js com a lista de todas as fotos
"""
from pathlib import Path
from PIL import Image, ImageOps

RAIZ = Path(__file__).parent
ORIG = RAIZ / "fotos"
WEB = ORIG / "web"
MINI = WEB / "mini"
EXT = {".jpg", ".jpeg", ".png", ".webp"}

WEB.mkdir(exist_ok=True)
MINI.mkdir(exist_ok=True)


def reduzir(img, lado_maior, destino, qualidade):
    im = img.copy()
    im.thumbnail((lado_maior, lado_maior))
    im.save(destino, "JPEG", quality=qualidade, optimize=True, progressive=True)


nomes = []
for f in sorted(ORIG.iterdir()):
    if f.suffix.lower() not in EXT:
        continue
    destino = f.stem + ".jpg"
    nomes.append(destino)
    if (WEB / destino).exists() and (MINI / destino).exists():
        continue
    print("novo:", f.name)
    img = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
    reduzir(img, 1600, WEB / destino, 82)
    reduzir(img, 700, MINI / destino, 78)

# mais recentes primeiro (os nomes começam com a data)
nomes.sort(reverse=True)
linhas = ",\n".join(f'  "fotos/web/{n}"' for n in nomes)
(RAIZ / "js" / "fotos.js").write_text(
    "/* Gerado por atualizar-fotos.py — não precisa editar. */\n"
    f"const FOTOS = [\n{linhas}\n];\n",
    encoding="utf-8",
)
print(f"{len(nomes)} fotos na galeria.")

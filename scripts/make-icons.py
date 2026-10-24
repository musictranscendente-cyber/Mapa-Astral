"""Generates public/icons/* from the square logo artwork.
Usage: pip install --target ./pylib pillow; python3 scripts/make-icons.py ./pylib logo.webp public/icons"""
import sys
sys.path.insert(0, sys.argv[1])
from PIL import Image, ImageDraw
src, out = sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGBA')
W, H = im.size
print('size', W, H, 'corner', im.getpixel((5, 5)), 'edge-mid', im.getpixel((W // 2, 3)), im.getpixel((3, H // 2)))
# find the glowing rounded square bounds: first non-black column/row along the middle lines
def first(seq):
    for i, p in enumerate(seq):
        if sum(p[:3]) > 60: return i
row = [im.getpixel((x, H // 2)) for x in range(W)]
col = [im.getpixel((W // 2, y)) for y in range(H)]
l = first(row); t = l
r = W - 1 - first(row[::-1]); b = r
print('bounds', l, t, r, b)
# full-bleed square icon: crop inside the rounded border, so the art fills the icon (OS applies its own mask)
inset = int((r - l) * 0.06)
art = im.crop((l + inset, t + inset, r - inset, b - inset)).convert('RGB')
for size, name in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png'), (64, 'favicon-64.png'), (32, 'favicon-32.png')]:
    art.resize((size, size), Image.LANCZOS).save(f'{out}/{name}', optimize=True)
# maskable: art with safe-zone padding on the app background colour
bg = Image.new('RGB', (512, 512), (7, 6, 26))
inner = art.resize((410, 410), Image.LANCZOS)
bg.paste(inner, (51, 51))
bg.save(f'{out}/icon-maskable-512.png', optimize=True)
# brand logo for the UI: the original rounded square with transparent corners
logo = im.crop((l, t, r + 1, b + 1))
mask = Image.new('L', logo.size, 0)
rad = int(logo.size[0] * 0.17)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, logo.size[0] - 1, logo.size[1] - 1), rad, fill=255)
logo.putalpha(mask)
logo.resize((256, 256), Image.LANCZOS).save(f'{out}/logo-256.webp', quality=88)

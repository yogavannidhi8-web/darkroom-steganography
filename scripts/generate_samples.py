"""
Generate synthetic deterministic test images for capstone experiments.
Creates 6 distinct test carriers across texture, edge, and gradient categories.
"""
import os
import io
import numpy as np
from PIL import Image, ImageDraw

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "experiments", "datasets")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate_flat_image(width=512, height=512) -> Image.Image:
    """Low-texture / smooth carrier: solid neutral tone with subtle gradient."""
    arr = np.full((height, width, 3), 160, dtype=np.uint8)
    # Add subtle vertical vignette
    y = np.linspace(0, 30, height, dtype=np.uint8)[:, None]
    arr[:, :, 0] = np.clip(arr[:, :, 0] - y, 0, 255)
    arr[:, :, 1] = np.clip(arr[:, :, 1] - y, 0, 255)
    arr[:, :, 2] = np.clip(arr[:, :, 2] - y // 2, 0, 255)
    return Image.fromarray(arr, 'RGB')


def generate_geometric_image(width=512, height=512) -> Image.Image:
    """Architectural / geometric scene with sharp edges."""
    img = Image.new('RGB', (width, height), color=(240, 238, 230))
    draw = ImageDraw.Draw(img)
    # Draw rectangles, diagonals and grids resembling structural architecture
    for i in range(0, width, 64):
        draw.line([(i, 0), (i, height)], fill=(180, 180, 175), width=2)
    for j in range(0, height, 64):
        draw.line([(0, j), (width, j)], fill=(180, 180, 175), width=2)
    # Sharp contrasting shapes
    draw.rectangle([80, 80, 280, 360], fill=(45, 55, 60), outline=(20, 25, 30), width=3)
    draw.polygon([(320, 80), (460, 200), (320, 320)], fill=(196, 90, 61), outline=(150, 60, 40), width=2)
    draw.ellipse([140, 260, 380, 460], fill=(82, 109, 76), outline=(40, 60, 35), width=2)
    return img


def generate_texture_image(width=512, height=512) -> Image.Image:
    """High-texture scene: Perlin-like pseudo-random natural noise texture."""
    rng = np.random.default_rng(12345)
    base = rng.integers(0, 256, (height // 4, width // 4, 3), dtype=np.uint8)
    base_img = Image.fromarray(base, 'RGB').resize((width, height), Image.Resampling.BILINEAR)
    base_arr = np.array(base_img, dtype=np.int16)
    fine_noise = rng.integers(-30, 31, (height, width, 3), dtype=np.int16)
    arr = np.clip(base_arr + fine_noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, 'RGB')


def generate_gradient_image(width=512, height=512) -> Image.Image:
    """Smooth multi-axis color gradient with minimal high frequencies."""
    x = np.linspace(0, 1, width)
    y = np.linspace(0, 1, height)
    xx, yy = np.meshgrid(x, y)
    r = (np.sin(xx * np.pi) * 255).astype(np.uint8)
    g = (np.cos(yy * np.pi / 2) * 255).astype(np.uint8)
    b = ((xx + yy) / 2 * 255).astype(np.uint8)
    arr = np.stack([r, g, b], axis=2)
    return Image.fromarray(arr, 'RGB')


def generate_synthetic_portrait(width=512, height=512) -> Image.Image:
    """Portrait-like composition: smooth skin tones + high-frequency hair/features."""
    img = Image.new('RGB', (width, height), color=(220, 215, 205))
    draw = ImageDraw.Draw(img)
    # Head contour (smooth skin tone)
    draw.ellipse([136, 100, 376, 420], fill=(225, 185, 155), outline=(180, 140, 115), width=2)
    # Eyes
    draw.ellipse([180, 210, 220, 235], fill=(255, 255, 255), outline=(80, 50, 40), width=2)
    draw.ellipse([195, 215, 215, 230], fill=(45, 65, 85))
    draw.ellipse([292, 210, 332, 235], fill=(255, 255, 255), outline=(80, 50, 40), width=2)
    draw.ellipse([307, 215, 327, 230], fill=(45, 65, 85))
    # Hair (high texture strokes)
    for i in range(120, 392, 4):
        draw.arc([i, 70, i + 30, 200], start=180, end=360, fill=(40, 30, 25), width=2)
    return img


def generate_dense_pattern(width=512, height=512) -> Image.Image:
    """Dense high-frequency checkerboard and concentric pattern."""
    arr = np.zeros((height, width, 3), dtype=np.uint8)
    for r in range(height):
        for c in range(width):
            dist = int(np.sqrt((r - height // 2)**2 + (c - width // 2)**2))
            checker = ((r // 8) + (c // 8)) % 2
            concentric = (dist // 8) % 2
            arr[r, c, 0] = 220 if checker else 35
            arr[r, c, 1] = 180 if concentric else 45
            arr[r, c, 2] = 200 if (checker ^ concentric) else 50
    return Image.fromarray(arr, 'RGB')


def main():
    generators = {
        "carrier_01_smooth_studio.png": generate_flat_image,
        "carrier_02_geometric_arch.png": generate_geometric_image,
        "carrier_03_natural_texture.png": generate_texture_image,
        "carrier_04_smooth_gradient.png": generate_gradient_image,
        "carrier_05_portrait_subject.png": generate_synthetic_portrait,
        "carrier_06_dense_pattern.png": generate_dense_pattern,
    }

    print(f"Generating synthetic test carriers into: {OUTPUT_DIR}")
    for name, gen in generators.items():
        path = os.path.join(OUTPUT_DIR, name)
        img = gen(512, 512)
        img.save(path, format='PNG')
        print(f"  ✓ Created {name} ({img.size[0]}x{img.size[1]})")


if __name__ == "__main__":
    main()

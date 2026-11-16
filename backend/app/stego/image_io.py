"""
Lossless image loading, validation and saving for the steganography system.
"""
import io
import struct
from typing import Tuple

import numpy as np
from PIL import Image

# Configuration
MAX_IMAGE_PIXELS = 8_000_000  # 8 megapixels
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB upload
SUPPORTED_FORMATS = {"PNG", "BMP", "TIFF"}
LOSSY_FORMATS = {"JPEG", "JPG", "WEBP"}

Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS


def load_and_validate_image(
    image_data: bytes,
    allow_formats: set = None,
) -> Tuple[np.ndarray, str, int, int]:
    """
    Load, validate and normalize an image to 8-bit RGB numpy array.
    
    Args:
        image_data: Raw image file bytes
        allow_formats: Set of allowed format strings (default: SUPPORTED_FORMATS)
    
    Returns:
        Tuple of (rgb_array, format_name, width, height)
    
    Raises:
        ValueError: If image is invalid, unsupported, or too large
    """
    if allow_formats is None:
        allow_formats = SUPPORTED_FORMATS
    
    if len(image_data) > MAX_FILE_SIZE_BYTES:
        raise ValueError(
            f"Image file too large: {len(image_data) / 1024 / 1024:.1f} MB "
            f"(maximum: {MAX_FILE_SIZE_BYTES // (1024*1024)} MB)"
        )
    
    try:
        img = Image.open(io.BytesIO(image_data))
        img.verify()  # Check for corruption
    except Exception as e:
        raise ValueError(f"Cannot decode image: {e}")
    
    # Re-open after verify (verify closes the file)
    try:
        img = Image.open(io.BytesIO(image_data))
    except Exception as e:
        raise ValueError(f"Cannot re-open image after validation: {e}")
    
    fmt = img.format
    if fmt is None:
        fmt = "UNKNOWN"
    
    # Check for lossy formats
    if fmt.upper() in LOSSY_FORMATS:
        raise ValueError(
            f"JPEG and other lossy formats are not suitable as embedding carriers. "
            f"They modify pixel values during compression, making reliable extraction "
            f"impossible. Please convert your image to PNG first."
        )
    
    # Check for supported lossless formats
    if fmt.upper() not in allow_formats:
        raise ValueError(
            f"Unsupported image format: {fmt}. "
            f"Supported lossless formats: {', '.join(sorted(allow_formats))}"
        )
    
    # Check for multi-frame images (animated GIF, multi-page TIFF)
    try:
        n_frames = getattr(img, 'n_frames', 1)
        if n_frames > 1:
            raise ValueError(
                f"Multi-frame images are not supported. "
                f"Please use a single-frame PNG."
            )
    except Exception:
        pass
    
    width, height = img.size
    total_pixels = width * height
    
    if total_pixels > MAX_IMAGE_PIXELS:
        raise ValueError(
            f"Image too large: {width}x{height} = {total_pixels:,} pixels "
            f"(maximum: {MAX_IMAGE_PIXELS:,} pixels)"
        )
    
    if width < 8 or height < 8:
        raise ValueError(f"Image too small: {width}x{height} (minimum 8x8)")
    
    # Normalize to RGB, preserving alpha separately
    if img.mode == 'RGBA':
        alpha = np.array(img.split()[3], dtype=np.uint8)
        rgb = img.convert('RGB')
        rgb_array = np.array(rgb, dtype=np.uint8)
        return rgb_array, fmt, width, height
    elif img.mode == 'RGB':
        rgb_array = np.array(img, dtype=np.uint8)
        return rgb_array, fmt, width, height
    elif img.mode in ('L', 'LA', 'P', 'PA'):
        # Convert grayscale/palette to RGB
        rgb = img.convert('RGB')
        rgb_array = np.array(rgb, dtype=np.uint8)
        return rgb_array, fmt, width, height
    elif img.mode in ('I', 'F'):
        # 32-bit integer or float — convert carefully
        rgb = img.convert('RGB')
        rgb_array = np.array(rgb, dtype=np.uint8)
        return rgb_array, fmt, width, height
    else:
        # Attempt generic conversion
        try:
            rgb = img.convert('RGB')
            rgb_array = np.array(rgb, dtype=np.uint8)
            return rgb_array, fmt, width, height
        except Exception as e:
            raise ValueError(f"Cannot convert image mode {img.mode!r} to RGB: {e}")


def array_to_png_bytes(rgb_array: np.ndarray) -> bytes:
    """
    Convert RGB numpy array to lossless PNG bytes.
    
    Args:
        rgb_array: Shape (H, W, 3), dtype=uint8
    
    Returns:
        Lossless PNG-encoded bytes
    """
    img = Image.fromarray(rgb_array, 'RGB')
    buf = io.BytesIO()
    img.save(buf, format='PNG', compress_level=1)  # Fast lossless
    return buf.getvalue()

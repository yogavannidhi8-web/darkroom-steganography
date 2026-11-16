"""Integration tests for the full steganography pipeline."""
import pytest
import numpy as np
from PIL import Image
import io
import zipfile

from app.services.encode_service import encode
from app.services.decode_service import decode
from app.stego.feature_map import make_stable_analysis_image
from app.stego.image_io import array_to_png_bytes, load_and_validate_image


def make_test_image(width=200, height=200, pattern="noise") -> bytes:
    """Create a synthetic test image."""
    rng = np.random.default_rng(42)
    if pattern == "noise":
        arr = rng.integers(0, 256, (height, width, 3), dtype=np.uint8)
    elif pattern == "gradient":
        x = np.linspace(0, 255, width, dtype=np.uint8)
        arr = np.zeros((height, width, 3), dtype=np.uint8)
        for row in range(height):
            arr[row, :, 0] = x
            arr[row, :, 1] = x[::-1]
            arr[row, :, 2] = 128
    elif pattern == "flat":
        arr = np.full((height, width, 3), 128, dtype=np.uint8)
    else:
        arr = rng.integers(0, 256, (height, width, 3), dtype=np.uint8)
    
    img = Image.fromarray(arr, 'RGB')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()


def test_text_roundtrip():
    """Full encode/decode roundtrip with text payload."""
    cover = make_test_image(300, 300, "noise")
    text = "Hello, this is a secret message for testing steganography!"
    password = "test-password-123"
    
    zip_bytes, report = encode(
        cover_image_bytes=cover,
        payload_data=text.encode("utf-8"),
        payload_type="text",
        filename="message.txt",
        password=password,
    )
    
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        stego_bytes = zf.read("stego.png")
    
    payload_bytes, payload_type, filename, verification = decode(stego_bytes, password)
    
    assert payload_bytes.decode("utf-8") == text
    assert payload_type == "text"
    assert verification["gcm_authenticated"] is True
    assert verification["sha256_digest_verified"] is True


def test_file_roundtrip():
    """Full encode/decode roundtrip with binary file payload."""
    cover = make_test_image(400, 400, "noise")
    file_data = bytes(range(256)) * 10  # 2560 bytes
    password = "file-test-password-456"
    
    zip_bytes, report = encode(
        cover_image_bytes=cover,
        payload_data=file_data,
        payload_type="file",
        filename="test.bin",
        password=password,
    )
    
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        stego_bytes = zf.read("stego.png")
    
    payload_bytes, payload_type, filename, verification = decode(stego_bytes, password)
    
    assert payload_bytes == file_data
    assert payload_type == "file"
    assert verification["gcm_authenticated"] is True
    assert verification["sha256_digest_verified"] is True


def test_wrong_password_rejected():
    """Wrong password must fail without releasing data."""
    cover = make_test_image(300, 300, "noise")
    
    zip_bytes, _ = encode(
        cover_image_bytes=cover,
        payload_data=b"secret",
        payload_type="text",
        filename="msg.txt",
        password="correct-password",
    )
    
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        stego_bytes = zf.read("stego.png")
    
    with pytest.raises(ValueError, match="AUTHENTICATION_FAILED"):
        decode(stego_bytes, "wrong-password")


def test_tampered_image_rejected():
    """Tampered stego image must fail authentication."""
    cover = make_test_image(300, 300, "noise")
    
    zip_bytes, _ = encode(
        cover_image_bytes=cover,
        payload_data=b"secret message here",
        payload_type="text",
        filename="msg.txt",
        password="tamper-test-password",
    )
    
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        stego_bytes = zf.read("stego.png")
    
    stego_arr, _, _, _ = load_and_validate_image(stego_bytes)
    h, w = stego_arr.shape[:2]
    stego_arr[h//2:h//2+10, w//2:w//2+10, :] ^= 0xFF
    tampered_bytes = array_to_png_bytes(stego_arr)
    
    with pytest.raises(ValueError):
        decode(tampered_bytes, "tamper-test-password")


def test_stable_analysis_map():
    """Verify that the stable analysis image is identical from cover and stego."""
    cover = make_test_image(200, 200, "noise")
    
    zip_bytes, _ = encode(
        cover_image_bytes=cover,
        payload_data=b"test payload for map stability",
        payload_type="text",
        filename="msg.txt",
        password="stability-test-password",
    )
    
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        stego_bytes = zf.read("stego.png")
    
    cover_arr, _, _, _ = load_and_validate_image(cover)
    stego_arr, _, _, _ = load_and_validate_image(stego_bytes)
    
    cover_stable = make_stable_analysis_image(cover_arr)
    stego_stable = make_stable_analysis_image(stego_arr)
    
    assert np.array_equal(cover_stable, stego_stable), \
        "Stable analysis images must be identical between cover and stego"


def test_insufficient_capacity_rejected():
    """Oversized payload must be rejected before embedding."""
    cover = make_test_image(50, 50, "flat")
    large_payload = bytes(10000)
    
    with pytest.raises(ValueError, match="INSUFFICIENT_CAPACITY|capacity"):
        encode(
            cover_image_bytes=cover,
            payload_data=large_payload,
            payload_type="file",
            filename="large.bin",
            password="test-password-123",
        )


def test_quality_metrics_identical_images():
    """Identical cover and stego produce zero MSE."""
    from app.analysis.quality import compute_mse, compute_psnr, compute_ssim
    
    arr = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
    mse = compute_mse(arr, arr)
    assert mse == 0.0
    
    psnr = compute_psnr(0.0)
    assert psnr is None
    
    ssim = compute_ssim(arr, arr)
    assert abs(ssim - 1.0) < 0.01

"""
Encode service: orchestrates the complete encoding pipeline.
"""
import io
import os
import time
import zipfile
import json
import tempfile
from typing import Tuple, Dict, Any

import numpy as np

from app.core.crypto import (
    derive_master_key, derive_subkeys, generate_salt, generate_nonce,
    encrypt_payload, DEFAULT_KDF_ID
)
from app.core.payload_format import serialize_payload
from app.stego.bootstrap import (
    BootstrapHeader, pack_header, embed_header_into_array,
    EMBED_ALGO_ADAPTIVE, ADAPTIVE_CONFIG_BALANCED, HEADER_CHANNELS, HEADER_SIZE
)
from app.stego.image_io import load_and_validate_image, array_to_png_bytes
from app.stego.feature_map import compute_score_map, compute_bit_allocation_map
from app.stego.permutation import build_candidate_slots, permute_slots, compute_capacity
from app.stego.embedding import embed_payload, bytes_to_bits
from app.analysis.quality import compute_full_quality_report


def encode(
    cover_image_bytes: bytes,
    payload_data: bytes,
    payload_type: str,
    filename: str,
    password: str,
    adaptive_config_id: int = ADAPTIVE_CONFIG_BALANCED,
    kdf_id: int = DEFAULT_KDF_ID,
) -> Tuple[bytes, Dict[str, Any]]:
    """
    Complete encoding pipeline.
    
    Returns:
        Tuple of (zip_archive_bytes, report_dict)
    """
    start_time = time.time()
    
    # 1. Load and validate cover image
    rgb_array, fmt, width, height = load_and_validate_image(cover_image_bytes)
    
    # 2. Serialize inner payload package
    inner_package = serialize_payload(payload_data, payload_type, filename)
    
    # 3. Generate cryptographic material
    salt = generate_salt()
    nonce = generate_nonce()
    
    # 4. Derive keys
    master_key = derive_master_key(password, salt, kdf_id)
    encryption_key, position_key = derive_subkeys(master_key)
    
    # 5. We need to know enc_pkg_len before building final header (for AAD),
    #    but AAD (header) contains enc_pkg_len. Use two-pass approach:
    #    Pass 1: encrypt with placeholder header -> get length
    #    Pass 2: build real header with correct length, re-derive nonce, re-encrypt

    # Pass 1: placeholder header to get ciphertext length
    placeholder_header = BootstrapHeader(
        format_version=0x01,
        kdf_id=kdf_id,
        embed_algo_id=EMBED_ALGO_ADAPTIVE,
        adaptive_config_id=adaptive_config_id,
        salt=salt,
        gcm_nonce=nonce,
        enc_pkg_len=0,
        image_width=width,
        image_height=height,
        flags=0,
    )
    ph_bytes = pack_header(placeholder_header)
    enc_pkg_probe = encrypt_payload(encryption_key, nonce, inner_package, ph_bytes)
    enc_pkg_len = len(enc_pkg_probe)

    # Pass 2: build final header with real enc_pkg_len, generate fresh nonce
    nonce2 = generate_nonce()
    final_header = BootstrapHeader(
        format_version=0x01,
        kdf_id=kdf_id,
        embed_algo_id=EMBED_ALGO_ADAPTIVE,
        adaptive_config_id=adaptive_config_id,
        salt=salt,
        gcm_nonce=nonce2,
        enc_pkg_len=enc_pkg_len,
        image_width=width,
        image_height=height,
        flags=0,
    )
    final_header_bytes = pack_header(final_header)
    encrypted_pkg_final = encrypt_payload(encryption_key, nonce2, inner_package, final_header_bytes)
    
    # 7. Compute adaptive feature map
    score_map = compute_score_map(rgb_array, adaptive_config_id)
    bit_alloc_map = compute_bit_allocation_map(score_map, adaptive_config_id)
    
    # 8. Build candidate slots (excluding header channels)
    slots = build_candidate_slots(bit_alloc_map, width, height, HEADER_CHANNELS)
    total_capacity = compute_capacity(slots)
    payload_bits_count = len(encrypted_pkg_final) * 8
    
    if payload_bits_count > total_capacity:
        raise ValueError(
            f"INSUFFICIENT_CAPACITY: Payload requires {payload_bits_count} bits but "
            f"image provides only {total_capacity} bits of adaptive capacity. "
            f"Use a larger image, smaller payload, or higher-capacity preset."
        )
    
    # 9. Key-dependent slot permutation
    permuted = permute_slots(slots, position_key)
    
    # 10. Embed header
    stego_array = rgb_array.copy()
    embed_header_into_array(stego_array, final_header_bytes)
    
    # 11. Embed encrypted payload
    payload_bits = bytes_to_bits(encrypted_pkg_final)
    stego_array = embed_payload(stego_array, permuted, payload_bits)
    
    # 12. Save stego image as lossless PNG
    stego_png_bytes = array_to_png_bytes(stego_array)
    
    # 13. Compute quality metrics
    encode_time = time.time() - start_time
    quality_report = compute_full_quality_report(
        cover=rgb_array,
        stego=stego_array,
        capacity_bits=total_capacity,
        payload_bits=payload_bits_count,
        encode_time=encode_time,
    )
    
    # 14. Build report (no secrets)
    report = {
        "version": "1.0",
        "algorithm": "Secure Adaptive Image Steganography",
        "embed_algo": "Adaptive Edge/Texture-Aware LSB (1-2 bit)",
        "adaptive_config_id": adaptive_config_id,
        "adaptive_config_name": ["", "Conservative", "Balanced", "High Capacity"][adaptive_config_id],
        "kdf": "Argon2id",
        "cipher": "AES-256-GCM",
        "integrity": "SHA-256 payload digest + AES-GCM authentication",
        "carrier_format": fmt,
        "carrier_dimensions": {"width": width, "height": height},
        "payload_type": payload_type,
        "payload_bytes": len(payload_data),
        "encrypted_package_bytes": len(encrypted_pkg_final),
        "total_capacity_bits": total_capacity,
        "payload_bits": payload_bits_count,
        "quality_metrics": quality_report,
        "note": (
            "This report contains no passwords, encryption keys, plaintext payload, "
            "nonces or salts. The stego image is a lossless PNG."
        ),
    }
    
    # 15. Package result as ZIP
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("stego.png", stego_png_bytes)
        zf.writestr("report.json", json.dumps(report, indent=2))
        readme = (
            "DARKROOM / IMAGE SECURITY LAB — Encode Result\n"
            "=============================================\n\n"
            "stego.png   — Lossless PNG containing the hidden encrypted payload\n"
            "report.json — Encoding metrics and algorithm settings (no secrets)\n\n"
            "To recover the hidden data, use the Decode function with the correct password.\n"
            "Keep the password safe — it cannot be recovered if lost.\n"
        )
        zf.writestr("README.txt", readme)
    
    return zip_buffer.getvalue(), report

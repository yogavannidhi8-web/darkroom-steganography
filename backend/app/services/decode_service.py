"""
Decode service: orchestrates the complete extraction and decryption pipeline.
"""
import io
import json
import time
import zipfile
from typing import Tuple, Dict, Any

import numpy as np

from app.core.crypto import derive_master_key, derive_subkeys, decrypt_payload
from app.core.payload_format import deserialize_payload
from app.stego.bootstrap import (
    extract_header_from_array, unpack_header, HEADER_CHANNELS
)
from app.stego.image_io import load_and_validate_image
from app.stego.feature_map import compute_score_map, compute_bit_allocation_map
from app.stego.permutation import build_candidate_slots, permute_slots, compute_capacity
from app.stego.embedding import extract_payload


def decode(
    stego_image_bytes: bytes,
    password: str,
) -> Tuple[bytes, str, str, Dict[str, Any]]:
    """
    Complete decoding pipeline with staged verification.
    
    Returns:
        Tuple of (payload_bytes, payload_type, filename, verification_report)
    
    Raises:
        ValueError: If any validation step fails (with descriptive error code prefix)
        cryptography.exceptions.InvalidTag: If authentication fails
    """
    start_time = time.time()
    
    # Stage 1: Load and validate stego image
    rgb_array, fmt, width, height = load_and_validate_image(stego_image_bytes)
    
    # Stage 2: Extract and validate bootstrap header
    raw_header_bytes = extract_header_from_array(rgb_array)
    header = unpack_header(raw_header_bytes)  # Validates magic, CRC, dimensions, IDs
    
    # Validate that stored dimensions match actual image dimensions
    if header.image_width != width or header.image_height != height:
        raise ValueError(
            f"DIMENSION_MISMATCH: Header says {header.image_width}x{header.image_height} "
            f"but actual image is {width}x{height}. Image may have been resized."
        )
    
    # Stage 3: Derive keys from password and header salt
    master_key = derive_master_key(password, header.salt, header.kdf_id)
    encryption_key, position_key = derive_subkeys(master_key)
    
    # Stage 4: Reconstruct adaptive map (identical to encoding due to stable analysis)
    score_map = compute_score_map(rgb_array, header.adaptive_config_id)
    bit_alloc_map = compute_bit_allocation_map(score_map, header.adaptive_config_id)
    
    # Stage 5: Rebuild candidate slots and permutation
    slots = build_candidate_slots(bit_alloc_map, width, height, HEADER_CHANNELS)
    total_capacity = compute_capacity(slots)
    
    payload_bits_needed = header.enc_pkg_len * 8
    if payload_bits_needed > total_capacity:
        raise ValueError(
            f"CAPACITY_ERROR: Header claims {header.enc_pkg_len} bytes but "
            f"image only has {total_capacity} bits capacity. Image may be corrupt."
        )
    
    permuted = permute_slots(slots, position_key)
    
    # Stage 6: Extract encrypted package
    encrypted_pkg = extract_payload(rgb_array, permuted, payload_bits_needed)
    
    # Stage 7: AES-GCM authentication + decryption (fails fast if wrong key/tampered)
    try:
        inner_package = decrypt_payload(
            encryption_key,
            header.gcm_nonce,
            encrypted_pkg,
            raw_header_bytes,  # AAD = complete header bytes
        )
        gcm_authenticated = True
    except Exception as e:
        raise ValueError(
            f"AUTHENTICATION_FAILED: AES-GCM authentication failed. "
            f"The password is incorrect or the stego image has been modified. "
            f"No data released."
        )
    
    # Stage 8: Parse inner package and verify SHA-256 digest
    try:
        payload_bytes, payload_type, filename, sha256_digest = deserialize_payload(inner_package)
        digest_verified = True
    except ValueError as e:
        raise ValueError(f"INTEGRITY_FAILED: {e}")
    
    decode_time = time.time() - start_time
    
    verification_report = {
        "header_valid": True,
        "header_magic_ok": True,
        "header_crc_ok": True,
        "dimension_match": True,
        "gcm_authenticated": gcm_authenticated,
        "sha256_digest_verified": digest_verified,
        "sha256_digest_hex": sha256_digest.hex(),
        "payload_type": payload_type,
        "filename": filename,
        "payload_bytes": len(payload_bytes),
        "decode_time_seconds": decode_time,
        "algorithm": "Adaptive Edge/Texture-Aware LSB",
        "kdf": "Argon2id",
        "cipher": "AES-256-GCM",
    }
    
    return payload_bytes, payload_type, filename, verification_report

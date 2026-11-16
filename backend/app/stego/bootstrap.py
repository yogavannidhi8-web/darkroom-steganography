"""
Fixed 64-byte bootstrap header for the steganography system.

Header layout (all big-endian):
  [0:8]   MAGIC (8 bytes): b'DRKRM\x01\x00\x00'
  [8:9]   FORMAT_VERSION (1 byte): 0x01
  [9:10]  KDF_ID (1 byte): allow-listed Argon2id preset
  [10:11] EMBED_ALGO_ID (1 byte): 0x01=adaptive
  [11:12] ADAPTIVE_CONFIG_ID (1 byte): 0x01=balanced
  [12:28] SALT (16 bytes): Argon2id salt
  [28:40] GCM_NONCE (12 bytes): AES-GCM nonce
  [40:48] ENC_PKG_LEN (8 bytes): encrypted package length in bytes
  [48:52] IMAGE_WIDTH (4 bytes): carrier image width
  [52:56] IMAGE_HEIGHT (4 bytes): carrier image height
  [56:60] FLAGS (4 bytes): reserved/version flags
  [60:64] HEADER_CRC32 (4 bytes): CRC32 of bytes [0:60]

The header occupies the first 512 RGB channel LSBs (64 bytes * 8 bits).
These positions are RESERVED and excluded from adaptive payload embedding.
"""
import struct
import zlib
from typing import NamedTuple

HEADER_MAGIC = b'DRKRM\x01\x00\x00'
HEADER_SIZE = 64
HEADER_VERSION = 0x01
HEADER_BITS = HEADER_SIZE * 8          # 512 bits
HEADER_CHANNELS = HEADER_BITS          # 1 bit per channel = 512 channels reserved

# Supported algorithm IDs
EMBED_ALGO_ADAPTIVE = 0x01
EMBED_ALGO_SEQUENTIAL = 0x02
EMBED_ALGO_PERMUTED = 0x03

# Supported adaptive config IDs
ADAPTIVE_CONFIG_CONSERVATIVE = 0x01
ADAPTIVE_CONFIG_BALANCED = 0x02
ADAPTIVE_CONFIG_HIGH_CAPACITY = 0x03

SUPPORTED_VERSIONS = {0x01}
SUPPORTED_KDF_IDS = {0x01, 0x02}
SUPPORTED_ALGO_IDS = {EMBED_ALGO_ADAPTIVE, EMBED_ALGO_SEQUENTIAL, EMBED_ALGO_PERMUTED}
SUPPORTED_CONFIG_IDS = {ADAPTIVE_CONFIG_CONSERVATIVE, ADAPTIVE_CONFIG_BALANCED, ADAPTIVE_CONFIG_HIGH_CAPACITY}

MAX_ENC_PKG_LEN = 100 * 1024 * 1024   # 100 MB safety bound


class BootstrapHeader(NamedTuple):
    format_version: int
    kdf_id: int
    embed_algo_id: int
    adaptive_config_id: int
    salt: bytes
    gcm_nonce: bytes
    enc_pkg_len: int
    image_width: int
    image_height: int
    flags: int


def pack_header(header: BootstrapHeader) -> bytes:
    """
    Serialize the 64-byte bootstrap header.
    
    Returns:
        64-byte header with CRC32 appended in last 4 bytes
    """
    body = (
        HEADER_MAGIC                                        # 8 bytes
        + struct.pack(">B", header.format_version)          # 1 byte
        + struct.pack(">B", header.kdf_id)                  # 1 byte
        + struct.pack(">B", header.embed_algo_id)           # 1 byte
        + struct.pack(">B", header.adaptive_config_id)      # 1 byte
        + header.salt                                       # 16 bytes
        + header.gcm_nonce                                  # 12 bytes
        + struct.pack(">Q", header.enc_pkg_len)             # 8 bytes
        + struct.pack(">I", header.image_width)             # 4 bytes
        + struct.pack(">I", header.image_height)            # 4 bytes
        + struct.pack(">I", header.flags)                   # 4 bytes
    )
    assert len(body) == 60, f"Header body must be 60 bytes, got {len(body)}"
    
    crc = zlib.crc32(body) & 0xFFFFFFFF
    return body + struct.pack(">I", crc)


def unpack_header(data: bytes) -> BootstrapHeader:
    """
    Parse and validate the 64-byte bootstrap header.
    
    Args:
        data: Exactly 64 bytes of header data
    
    Returns:
        Parsed BootstrapHeader
    
    Raises:
        ValueError: If header is invalid, corrupt or unsupported
    """
    if len(data) != HEADER_SIZE:
        raise ValueError(f"Header must be exactly {HEADER_SIZE} bytes, got {len(data)}")
    
    # Check magic
    magic = data[0:8]
    if magic != HEADER_MAGIC:
        raise ValueError(f"Invalid header magic — not a DARKROOM stego image")
    
    # Verify CRC32 before trusting any other field
    body = data[0:60]
    stored_crc = struct.unpack(">I", data[60:64])[0]
    computed_crc = zlib.crc32(body) & 0xFFFFFFFF
    if stored_crc != computed_crc:
        raise ValueError(f"Header CRC32 mismatch — header is corrupt (stored: {stored_crc:#010x}, computed: {computed_crc:#010x})")
    
    # Parse fields
    pos = 8
    format_version = data[pos]; pos += 1
    kdf_id = data[pos]; pos += 1
    embed_algo_id = data[pos]; pos += 1
    adaptive_config_id = data[pos]; pos += 1
    salt = data[pos:pos+16]; pos += 16
    gcm_nonce = data[pos:pos+12]; pos += 12
    enc_pkg_len = struct.unpack(">Q", data[pos:pos+8])[0]; pos += 8
    image_width = struct.unpack(">I", data[pos:pos+4])[0]; pos += 4
    image_height = struct.unpack(">I", data[pos:pos+4])[0]; pos += 4
    flags = struct.unpack(">I", data[pos:pos+4])[0]; pos += 4
    # pos == 60; CRC already verified
    
    # Validate allow-listed IDs
    if format_version not in SUPPORTED_VERSIONS:
        raise ValueError(f"Unsupported format version: {format_version}")
    if kdf_id not in SUPPORTED_KDF_IDS:
        raise ValueError(f"Unsupported KDF ID: {kdf_id:#04x}")
    if embed_algo_id not in SUPPORTED_ALGO_IDS:
        raise ValueError(f"Unsupported embedding algorithm ID: {embed_algo_id:#04x}")
    if adaptive_config_id not in SUPPORTED_CONFIG_IDS:
        raise ValueError(f"Unsupported adaptive config ID: {adaptive_config_id:#04x}")
    
    # Validate plausible dimensions
    if image_width < 8 or image_height < 8:
        raise ValueError(f"Image dimensions too small: {image_width}x{image_height}")
    if image_width > 20000 or image_height > 20000:
        raise ValueError(f"Image dimensions implausibly large: {image_width}x{image_height}")
    
    # Validate encrypted package length
    if enc_pkg_len > MAX_ENC_PKG_LEN:
        raise ValueError(f"Encrypted package length too large: {enc_pkg_len}")
    
    # Validate sufficient pixel space for header
    total_channels = image_width * image_height * 3
    if total_channels < HEADER_CHANNELS:
        raise ValueError(f"Image too small to contain header: needs {HEADER_CHANNELS} channels, has {total_channels}")
    
    return BootstrapHeader(
        format_version=format_version,
        kdf_id=kdf_id,
        embed_algo_id=embed_algo_id,
        adaptive_config_id=adaptive_config_id,
        salt=salt,
        gcm_nonce=gcm_nonce,
        enc_pkg_len=enc_pkg_len,
        image_width=image_width,
        image_height=image_height,
        flags=flags,
    )


def embed_header_into_array(rgb_array, header_bytes: bytes):
    """
    Embed 64-byte header into the first 512 RGB channel values using 1 LSB per channel.
    
    Args:
        rgb_array: numpy array shape (H, W, 3) dtype=uint8, modified in-place
        header_bytes: Exactly 64 bytes
    """
    import numpy as np
    assert len(header_bytes) == HEADER_SIZE
    flat = rgb_array.reshape(-1)  # Flatten to 1D channel array
    
    bit_idx = 0
    for byte_val in header_bytes:
        for bit_pos in range(7, -1, -1):  # MSB first
            bit = (byte_val >> bit_pos) & 1
            channel_idx = bit_idx
            flat[channel_idx] = (flat[channel_idx] & 0xFE) | bit
            bit_idx += 1
    # rgb_array is modified in-place via shared memory with flat


def extract_header_from_array(rgb_array) -> bytes:
    """
    Extract 64-byte header from the first 512 RGB channel values.
    
    Args:
        rgb_array: numpy array shape (H, W, 3) dtype=uint8
    
    Returns:
        64 bytes of header data
    """
    flat = rgb_array.reshape(-1)
    
    header_bytes = bytearray(HEADER_SIZE)
    bit_idx = 0
    for byte_idx in range(HEADER_SIZE):
        byte_val = 0
        for bit_pos in range(7, -1, -1):  # MSB first
            bit = flat[bit_idx] & 1
            byte_val = (byte_val << 1) | bit
            bit_idx += 1
        header_bytes[byte_idx] = byte_val
    
    return bytes(header_bytes)

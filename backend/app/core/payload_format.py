"""
Inner payload package format.
Serializes/deserializes the structured payload with metadata for embedding.

Binary layout of inner package:
  [0:4]   MAGIC (4 bytes): b'DRIM'
  [4:5]   FORMAT_VERSION (1 byte): 0x01
  [5:6]   PAYLOAD_TYPE (1 byte): 0x01=text, 0x02=file
  [6:8]   FILENAME_LEN (2 bytes, big-endian): length of sanitized filename
  [8:8+N] FILENAME (N bytes, UTF-8): sanitized basename
  [8+N:8+N+4]  PAYLOAD_LEN (4 bytes, big-endian): original payload length
  [8+N+4:8+N+36] SHA256 (32 bytes): SHA-256 of original payload
  [8+N+36:...] PAYLOAD_BYTES: original payload data
"""
import os
import re
import struct
from typing import Tuple, Literal

INNER_MAGIC = b'DRIM'
INNER_FORMAT_VERSION = 0x01
PAYLOAD_TYPE_TEXT = 0x01
PAYLOAD_TYPE_FILE = 0x02

MAX_FILENAME_LEN = 255
MAX_PAYLOAD_LEN = 50 * 1024 * 1024  # 50 MB safety bound


def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename: extract basename, remove path traversal sequences,
    keep only safe characters, preserve useful extension.
    """
    # Extract basename only
    basename = os.path.basename(filename)
    # Remove path separators and traversal sequences
    basename = re.sub(r'[/\\:*?"<>|]', '_', basename)
    basename = basename.lstrip('.')
    if not basename:
        basename = "recovered_file"
    # Limit length
    if len(basename.encode('utf-8')) > MAX_FILENAME_LEN:
        name, ext = os.path.splitext(basename)
        max_name = MAX_FILENAME_LEN - len(ext.encode('utf-8')) - 1
        basename = name.encode('utf-8')[:max_name].decode('utf-8', errors='ignore') + ext
    return basename


def serialize_payload(
    payload_bytes: bytes,
    payload_type: Literal["text", "file"],
    filename: str = "message.txt",
) -> bytes:
    """
    Serialize payload into inner package binary format.
    
    Args:
        payload_bytes: Raw payload data
        payload_type: "text" or "file"
        filename: Sanitized filename (used for file type)
    
    Returns:
        Serialized inner package bytes
    """
    from app.core.crypto import compute_sha256
    
    type_byte = PAYLOAD_TYPE_TEXT if payload_type == "text" else PAYLOAD_TYPE_FILE
    safe_filename = sanitize_filename(filename)
    filename_encoded = safe_filename.encode('utf-8')
    
    if len(filename_encoded) > MAX_FILENAME_LEN:
        raise ValueError(f"Filename too long after sanitization")
    
    payload_len = len(payload_bytes)
    if payload_len > MAX_PAYLOAD_LEN:
        raise ValueError(f"Payload too large: {payload_len} bytes (max {MAX_PAYLOAD_LEN})")
    
    sha256_digest = compute_sha256(payload_bytes)
    
    package = (
        INNER_MAGIC
        + bytes([INNER_FORMAT_VERSION])
        + bytes([type_byte])
        + struct.pack(">H", len(filename_encoded))
        + filename_encoded
        + struct.pack(">I", payload_len)
        + sha256_digest
        + payload_bytes
    )
    return package


def deserialize_payload(package_bytes: bytes) -> Tuple[bytes, str, str, bytes]:
    """
    Deserialize inner package and verify SHA-256 digest.
    
    Args:
        package_bytes: Serialized inner package
    
    Returns:
        Tuple of (payload_bytes, payload_type, filename, sha256_digest)
    
    Raises:
        ValueError: If format is invalid or digest does not match
    """
    from app.core.crypto import compute_sha256, constant_time_compare
    
    if len(package_bytes) < 8 + 2 + 4 + 32:
        raise ValueError("Package too short to be valid")
    
    pos = 0
    
    # Magic
    magic = package_bytes[pos:pos+4]
    pos += 4
    if magic != INNER_MAGIC:
        raise ValueError(f"Invalid inner magic: {magic!r}")
    
    # Format version
    version = package_bytes[pos]
    pos += 1
    if version != INNER_FORMAT_VERSION:
        raise ValueError(f"Unsupported inner format version: {version}")
    
    # Payload type
    type_byte = package_bytes[pos]
    pos += 1
    if type_byte == PAYLOAD_TYPE_TEXT:
        payload_type = "text"
    elif type_byte == PAYLOAD_TYPE_FILE:
        payload_type = "file"
    else:
        raise ValueError(f"Unknown payload type byte: {type_byte}")
    
    # Filename
    if pos + 2 > len(package_bytes):
        raise ValueError("Truncated at filename length")
    filename_len = struct.unpack(">H", package_bytes[pos:pos+2])[0]
    pos += 2
    if filename_len > MAX_FILENAME_LEN:
        raise ValueError(f"Filename length too large: {filename_len}")
    if pos + filename_len > len(package_bytes):
        raise ValueError("Truncated at filename")
    filename = package_bytes[pos:pos+filename_len].decode('utf-8', errors='replace')
    pos += filename_len
    
    # Payload length
    if pos + 4 > len(package_bytes):
        raise ValueError("Truncated at payload length")
    payload_len = struct.unpack(">I", package_bytes[pos:pos+4])[0]
    pos += 4
    if payload_len > MAX_PAYLOAD_LEN:
        raise ValueError(f"Payload length too large: {payload_len}")
    
    # SHA-256 digest
    if pos + 32 > len(package_bytes):
        raise ValueError("Truncated at SHA-256 digest")
    stored_digest = package_bytes[pos:pos+32]
    pos += 32
    
    # Payload bytes
    if pos + payload_len > len(package_bytes):
        raise ValueError(f"Truncated at payload data: need {payload_len}, have {len(package_bytes) - pos}")
    payload_bytes = package_bytes[pos:pos+payload_len]
    
    # Verify SHA-256 digest
    computed_digest = compute_sha256(payload_bytes)
    if not constant_time_compare(computed_digest, stored_digest):
        raise ValueError("SHA-256 payload digest mismatch — data integrity failure")
    
    return payload_bytes, payload_type, filename, stored_digest

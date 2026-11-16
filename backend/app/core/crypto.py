"""
Cryptographic operations for the steganography system.
Uses Argon2id for key derivation and AES-256-GCM for authenticated encryption.
"""
import os
import struct
import hashlib
import hmac
from typing import Tuple

from argon2.low_level import hash_secret_raw, Type
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.backends import default_backend


# --- KDF Parameter Presets (versioned, allow-listed) ---
KDF_PRESETS = {
    0x01: {
        "name": "argon2id-v1",
        "memory_cost": 65536,   # 64 MiB
        "time_cost": 3,
        "parallelism": 2,
        "hash_len": 32,
    },
    0x02: {
        "name": "argon2id-v2-demo",  # reduced for constrained environments
        "memory_cost": 19456,   # 19 MiB (OWASP minimum)
        "time_cost": 2,
        "parallelism": 1,
        "hash_len": 32,
    },
}

DEFAULT_KDF_ID = 0x01


def derive_master_key(
    password: str,
    salt: bytes,
    kdf_id: int = DEFAULT_KDF_ID,
) -> bytes:
    """
    Derive a 32-byte master key from password using Argon2id.
    
    Args:
        password: User passphrase (UTF-8 encoded)
        salt: 16-byte cryptographically random salt
        kdf_id: KDF preset identifier (allow-listed)
    
    Returns:
        32-byte derived key
    
    Raises:
        ValueError: If kdf_id is not in the allow-list
    """
    if kdf_id not in KDF_PRESETS:
        raise ValueError(f"Unsupported KDF ID: {kdf_id:#04x}")
    if len(salt) != 16:
        raise ValueError("Salt must be exactly 16 bytes")
    
    preset = KDF_PRESETS[kdf_id]
    
    master_key = hash_secret_raw(
        secret=password.encode("utf-8"),
        salt=salt,
        time_cost=preset["time_cost"],
        memory_cost=preset["memory_cost"],
        parallelism=preset["parallelism"],
        hash_len=preset["hash_len"],
        type=Type.ID,
    )
    return master_key


def derive_subkeys(master_key: bytes) -> Tuple[bytes, bytes]:
    """
    Derive separate subkeys for encryption and position ordering using HKDF-SHA256.
    
    Args:
        master_key: 32-byte master key from Argon2id
    
    Returns:
        Tuple of (encryption_key, position_key), each 32 bytes
    """
    encryption_key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b"darkroom-steganography-encryption-v1",
        backend=default_backend(),
    ).derive(master_key)
    
    position_key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b"darkroom-steganography-position-v1",
        backend=default_backend(),
    ).derive(master_key)
    
    return encryption_key, position_key


def generate_salt() -> bytes:
    """Generate a fresh 16-byte cryptographically random salt."""
    return os.urandom(16)


def generate_nonce() -> bytes:
    """Generate a fresh 96-bit (12-byte) nonce for AES-GCM."""
    return os.urandom(12)


def encrypt_payload(
    encryption_key: bytes,
    nonce: bytes,
    plaintext: bytes,
    associated_data: bytes,
) -> bytes:
    """
    Encrypt plaintext using AES-256-GCM with associated authenticated data.
    
    Args:
        encryption_key: 32-byte AES key
        nonce: 12-byte nonce (must be unique per key)
        plaintext: Data to encrypt
        associated_data: Header bytes included in authentication (AAD)
    
    Returns:
        Ciphertext with appended GCM authentication tag (ciphertext || tag)
    """
    if len(encryption_key) != 32:
        raise ValueError("Encryption key must be 32 bytes")
    if len(nonce) != 12:
        raise ValueError("Nonce must be 12 bytes")
    
    aesgcm = AESGCM(encryption_key)
    # cryptography library appends 16-byte tag automatically
    ciphertext_with_tag = aesgcm.encrypt(nonce, plaintext, associated_data)
    return ciphertext_with_tag


def decrypt_payload(
    encryption_key: bytes,
    nonce: bytes,
    ciphertext_with_tag: bytes,
    associated_data: bytes,
) -> bytes:
    """
    Decrypt and authenticate AES-256-GCM ciphertext.
    
    Args:
        encryption_key: 32-byte AES key
        nonce: 12-byte nonce (from header)
        ciphertext_with_tag: Encrypted data with authentication tag
        associated_data: Header bytes (must match what was used for encryption)
    
    Returns:
        Decrypted plaintext
    
    Raises:
        cryptography.exceptions.InvalidTag: If authentication fails (wrong key/tampered)
    """
    if len(encryption_key) != 32:
        raise ValueError("Encryption key must be 32 bytes")
    if len(nonce) != 12:
        raise ValueError("Nonce must be 12 bytes")
    
    aesgcm = AESGCM(encryption_key)
    # Raises InvalidTag if authentication fails — no plaintext is returned
    plaintext = aesgcm.decrypt(nonce, ciphertext_with_tag, associated_data)
    return plaintext


def compute_sha256(data: bytes) -> bytes:
    """Compute SHA-256 digest of data."""
    return hashlib.sha256(data).digest()


def constant_time_compare(a: bytes, b: bytes) -> bool:
    """Compare two byte strings in constant time to prevent timing attacks."""
    return hmac.compare_digest(a, b)

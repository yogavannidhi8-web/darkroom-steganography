"""Tests for cryptographic operations."""
import pytest
from app.core.crypto import (
    derive_master_key, derive_subkeys, generate_salt, generate_nonce,
    encrypt_payload, decrypt_payload, compute_sha256, constant_time_compare,
    DEFAULT_KDF_ID
)


def test_derive_master_key_stable():
    salt = bytes(16)
    k1 = derive_master_key("testpassword", salt, DEFAULT_KDF_ID)
    k2 = derive_master_key("testpassword", salt, DEFAULT_KDF_ID)
    assert k1 == k2
    assert len(k1) == 32


def test_derive_master_key_different_salts():
    salt1 = generate_salt()
    salt2 = generate_salt()
    k1 = derive_master_key("testpassword", salt1, DEFAULT_KDF_ID)
    k2 = derive_master_key("testpassword", salt2, DEFAULT_KDF_ID)
    assert k1 != k2


def test_derive_master_key_different_passwords():
    salt = generate_salt()
    k1 = derive_master_key("password1", salt, DEFAULT_KDF_ID)
    k2 = derive_master_key("password2", salt, DEFAULT_KDF_ID)
    assert k1 != k2


def test_derive_subkeys_different():
    master = bytes(32)
    enc_key, pos_key = derive_subkeys(master)
    assert len(enc_key) == 32
    assert len(pos_key) == 32
    assert enc_key != pos_key


def test_aes_gcm_roundtrip():
    key = bytes(32)
    nonce = bytes(12)
    plaintext = b"Hello, steganography!"
    aad = b"associated data"
    
    ciphertext = encrypt_payload(key, nonce, plaintext, aad)
    recovered = decrypt_payload(key, nonce, ciphertext, aad)
    assert recovered == plaintext


def test_aes_gcm_wrong_key():
    key1 = bytes(32)
    key2 = b'\x01' * 32
    nonce = bytes(12)
    plaintext = b"secret"
    aad = b"aad"
    
    ciphertext = encrypt_payload(key1, nonce, plaintext, aad)
    with pytest.raises(Exception):
        decrypt_payload(key2, nonce, ciphertext, aad)


def test_aes_gcm_tampered_ciphertext():
    key = bytes(32)
    nonce = bytes(12)
    plaintext = b"secret message"
    aad = b"aad"
    
    ciphertext = encrypt_payload(key, nonce, plaintext, aad)
    tampered = bytearray(ciphertext)
    tampered[0] ^= 0xFF
    
    with pytest.raises(Exception):
        decrypt_payload(key, nonce, bytes(tampered), aad)


def test_aes_gcm_wrong_aad():
    key = bytes(32)
    nonce = bytes(12)
    plaintext = b"secret"
    aad = b"correct aad"
    wrong_aad = b"wrong aad"
    
    ciphertext = encrypt_payload(key, nonce, plaintext, aad)
    with pytest.raises(Exception):
        decrypt_payload(key, nonce, ciphertext, wrong_aad)


def test_nonce_uniqueness():
    nonces = {generate_nonce() for _ in range(100)}
    assert len(nonces) == 100


def test_salt_uniqueness():
    salts = {generate_salt() for _ in range(100)}
    assert len(salts) == 100


def test_sha256():
    data = b"test data"
    digest = compute_sha256(data)
    assert len(digest) == 32
    assert digest == compute_sha256(data)


def test_constant_time_compare():
    assert constant_time_compare(b"abc", b"abc") is True
    assert constant_time_compare(b"abc", b"xyz") is False

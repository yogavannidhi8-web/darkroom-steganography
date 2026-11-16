"""
Key-dependent deterministic slot ordering using ChaCha20 stream.

Security note:
  The permutation provides an additional extraction barrier — without the
  password, the slot order cannot be reproduced. However, confidentiality
  is primarily provided by AES-256-GCM encryption. Do not claim that the
  permutation alone protects the payload.
"""
import struct
import numpy as np
from typing import List, Tuple

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms
from cryptography.hazmat.backends import default_backend


def _chacha20_keystream(key: bytes, length: int) -> bytes:
    """
    Generate a deterministic keystream using ChaCha20 with zero nonce.
    
    Args:
        key: 32-byte key (derived position key)
        length: Number of keystream bytes needed
    
    Returns:
        Deterministic keystream bytes
    """
    # Use fixed zero nonce — acceptable here because:
    # 1. The key is freshly derived per encode operation (from fresh salt)
    # 2. The keystream is used only for one-time permutation generation
    nonce = b'\x00' * 16  # ChaCha20 in cryptography library uses 16-byte nonce
    cipher = Cipher(
        algorithms.ChaCha20(key, nonce),
        mode=None,
        backend=default_backend(),
    )
    encryptor = cipher.encryptor()
    # Encrypt zeros to get the keystream
    return encryptor.update(b'\x00' * length)


def fisher_yates_shuffle(indices: np.ndarray, position_key: bytes) -> np.ndarray:
    """
    Apply a deterministic Fisher-Yates shuffle to an index array using a ChaCha20 keystream.
    
    For large arrays, generates 4-byte random values for each swap position.
    
    Args:
        indices: 1D array of slot indices
        position_key: 32-byte derived position key
    
    Returns:
        Shuffled index array
    """
    n = len(indices)
    if n <= 1:
        return indices.copy()
    
    result = indices.copy()
    
    # Generate enough random bytes: 4 bytes per swap needed (n-1 swaps)
    num_swaps = n - 1
    keystream = _chacha20_keystream(position_key, num_swaps * 4)
    
    for i in range(n - 1, 0, -1):
        swap_idx = num_swaps - 1 - (n - 1 - i)
        # Read 4-byte unsigned integer from keystream
        rand_val = struct.unpack_from(">I", keystream, swap_idx * 4)[0]
        j = rand_val % (i + 1)
        result[i], result[j] = result[j], result[i]
    
    return result


def build_candidate_slots(
    bit_allocation_map: np.ndarray,
    image_width: int,
    image_height: int,
    header_channels: int,
) -> List[Tuple[int, int, int, int]]:
    """
    Build an ordered list of candidate embedding slots from the bit allocation map.
    
    Each slot is (pixel_row, pixel_col, channel_idx, bits_to_use).
    Header channels are excluded.
    
    Args:
        bit_allocation_map: (H, W) uint8 array of bit allocations per pixel
        image_width: Image width
        image_height: Image height
        header_channels: Number of channels reserved for header
    
    Returns:
        List of (row, col, channel, bits) tuples
    """
    slots = []
    flat_channel_idx = 0
    
    for row in range(image_height):
        for col in range(image_width):
            bits = int(bit_allocation_map[row, col])
            if bits == 0:
                flat_channel_idx += 3  # Skip all 3 channels for this pixel
                continue
            for ch in range(3):  # R, G, B
                if flat_channel_idx >= header_channels:
                    slots.append((row, col, ch, bits))
                flat_channel_idx += 1
    
    return slots


def permute_slots(
    slots: List[Tuple[int, int, int, int]],
    position_key: bytes,
) -> List[Tuple[int, int, int, int]]:
    """
    Apply key-dependent Fisher-Yates shuffle to candidate slots.
    
    Args:
        slots: List of (row, col, channel, bits) tuples
        position_key: 32-byte derived position key
    
    Returns:
        Shuffled slot list
    """
    n = len(slots)
    if n == 0:
        return []
    
    indices = np.arange(n, dtype=np.int64)
    shuffled_indices = fisher_yates_shuffle(indices, position_key)
    
    return [slots[i] for i in shuffled_indices]


def compute_capacity(slots: List[Tuple[int, int, int, int]]) -> int:
    """
    Calculate total payload capacity in bits from a slot list.
    
    Args:
        slots: List of (row, col, channel, bits) tuples
    
    Returns:
        Total capacity in bits
    """
    return sum(bits for _, _, _, bits in slots)

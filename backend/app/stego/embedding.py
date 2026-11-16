"""
Steganographic embedding: writes encrypted payload into image using adaptive slots.
"""
import numpy as np
from typing import List, Tuple


def bytes_to_bits(data: bytes) -> List[int]:
    """Convert bytes to list of bits (MSB first)."""
    bits = []
    for byte in data:
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)
    return bits


def bits_to_bytes(bits: List[int]) -> bytes:
    """Convert list of bits (MSB first) to bytes."""
    result = bytearray()
    for i in range(0, len(bits), 8):
        byte_bits = bits[i:i+8]
        if len(byte_bits) < 8:
            byte_bits += [0] * (8 - len(byte_bits))
        byte_val = 0
        for b in byte_bits:
            byte_val = (byte_val << 1) | b
        result.append(byte_val)
    return bytes(result)


def embed_payload(
    rgb_array: np.ndarray,
    permuted_slots: List[Tuple[int, int, int, int]],
    payload_bits: List[int],
) -> np.ndarray:
    """
    Embed payload bits into permuted candidate slots.
    
    For 1-bit slots: modify only the LSB of the channel.
    For 2-bit slots: modify the two LSBs of the channel.
    
    Args:
        rgb_array: (H, W, 3) uint8 image array (copied before modification)
        permuted_slots: Shuffled list of (row, col, channel, bits)
        payload_bits: List of bits to embed
    
    Returns:
        Modified (H, W, 3) uint8 array
    
    Raises:
        ValueError: If payload does not fit in available slots
    """
    result = rgb_array.copy()
    bit_idx = 0
    total_capacity_bits = sum(bits for _, _, _, bits in permuted_slots)
    
    if len(payload_bits) > total_capacity_bits:
        raise ValueError(
            f"Payload ({len(payload_bits)} bits) exceeds slot capacity "
            f"({total_capacity_bits} bits)"
        )
    
    for row, col, ch, bits in permuted_slots:
        if bit_idx >= len(payload_bits):
            break
        
        pixel_val = int(result[row, col, ch])
        
        if bits == 1:
            if bit_idx < len(payload_bits):
                bit = payload_bits[bit_idx]
                pixel_val = (pixel_val & 0xFE) | bit
                bit_idx += 1
        elif bits == 2:
            # Embed 2 bits: b1 is MSB (bit 1), b0 is LSB (bit 0)
            bits_available = len(payload_bits) - bit_idx
            if bits_available >= 2:
                b1 = payload_bits[bit_idx]
                b0 = payload_bits[bit_idx + 1]
                pixel_val = (pixel_val & 0xFC) | (b1 << 1) | b0
                bit_idx += 2
            elif bits_available == 1:
                b1 = payload_bits[bit_idx]
                pixel_val = (pixel_val & 0xFC) | (b1 << 1) | 0  # pad LSB with 0
                bit_idx += 1
        
        result[row, col, ch] = pixel_val
    
    return result


def extract_payload(
    rgb_array: np.ndarray,
    permuted_slots: List[Tuple[int, int, int, int]],
    total_bits: int,
) -> bytes:
    """
    Extract payload bits from permuted candidate slots.
    
    Args:
        rgb_array: (H, W, 3) uint8 stego image array
        permuted_slots: Same shuffled slot list used during encoding
        total_bits: Exact number of bits to extract
    
    Returns:
        Extracted bytes
    """
    extracted_bits = []
    
    for row, col, ch, bits in permuted_slots:
        if len(extracted_bits) >= total_bits:
            break
        
        pixel_val = int(rgb_array[row, col, ch])
        
        if bits == 1:
            extracted_bits.append(pixel_val & 1)
        elif bits == 2:
            bits_needed = total_bits - len(extracted_bits)
            if bits_needed >= 2:
                b1 = (pixel_val >> 1) & 1
                b0 = pixel_val & 1
                extracted_bits.append(b1)
                extracted_bits.append(b0)
            else:
                b1 = (pixel_val >> 1) & 1
                extracted_bits.append(b1)
    
    return bits_to_bytes(extracted_bits[:total_bits])

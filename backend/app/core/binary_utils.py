"""Utility functions for binary data operations."""
import struct
import zlib


def crc32_bytes(data: bytes) -> int:
    """Compute CRC32 of bytes."""
    return zlib.crc32(data) & 0xFFFFFFFF

def pack_uint8(value: int) -> bytes:
    return struct.pack(">B", value)

def pack_uint16(value: int) -> bytes:
    return struct.pack(">H", value)

def pack_uint32(value: int) -> bytes:
    return struct.pack(">I", value)

def pack_uint64(value: int) -> bytes:
    return struct.pack(">Q", value)

def unpack_uint8(data: bytes, offset: int) -> int:
    return struct.unpack_from(">B", data, offset)[0]

def unpack_uint16(data: bytes, offset: int) -> int:
    return struct.unpack_from(">H", data, offset)[0]

def unpack_uint32(data: bytes, offset: int) -> int:
    return struct.unpack_from(">I", data, offset)[0]

def unpack_uint64(data: bytes, offset: int) -> int:
    return struct.unpack_from(">Q", data, offset)[0]

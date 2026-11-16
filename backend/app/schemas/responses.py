"""Pydantic response schemas."""
from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail


class CapacityStats(BaseModel):
    width: int
    height: int
    format: str
    total_pixels: int
    total_channels: int
    header_channels: int
    usable_capacity_bits: int
    usable_capacity_bytes: int
    zero_bit_pixels: int
    one_bit_pixels: int
    two_bit_pixels: int
    adaptive_config_name: str
    warnings: List[str]

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.stego.image_io import load_and_validate_image, MAX_FILE_SIZE_BYTES
from app.stego.feature_map import compute_score_map, compute_bit_allocation_map, ADAPTIVE_CONFIGS
from app.stego.permutation import build_candidate_slots, compute_capacity
from app.stego.bootstrap import HEADER_CHANNELS
import numpy as np

router = APIRouter()

@router.post("/capacity")
async def get_capacity(
    cover: UploadFile = File(...),
    adaptive_config_id: int = Form(2),
):
    data = await cover.read()
    if len(data) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(400, "File too large")
    
    try:
        rgb, fmt, w, h = load_and_validate_image(data)
    except ValueError as e:
        raise HTTPException(422, str(e))
    
    if adaptive_config_id not in ADAPTIVE_CONFIGS:
        adaptive_config_id = 2
    
    score_map = compute_score_map(rgb, adaptive_config_id)
    alloc_map = compute_bit_allocation_map(score_map, adaptive_config_id)
    slots = build_candidate_slots(alloc_map, w, h, HEADER_CHANNELS)
    capacity_bits = compute_capacity(slots)
    
    zero_px = int(np.sum(alloc_map == 0))
    one_px = int(np.sum(alloc_map == 1))
    two_px = int(np.sum(alloc_map == 2))
    
    warnings = []
    if capacity_bits < 1024 * 8:
        warnings.append("Low capacity: image may be too small or low-texture for large payloads")
    
    return {
        "width": w,
        "height": h,
        "format": fmt,
        "total_pixels": w * h,
        "total_channels": w * h * 3,
        "header_channels": HEADER_CHANNELS,
        "usable_capacity_bits": capacity_bits,
        "usable_capacity_bytes": capacity_bits // 8,
        "zero_bit_pixels": zero_px,
        "one_bit_pixels": one_px,
        "two_bit_pixels": two_px,
        "adaptive_config_name": ADAPTIVE_CONFIGS[adaptive_config_id]["name"],
        "warnings": warnings,
    }

from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np, base64, io
from PIL import Image
from app.stego.image_io import load_and_validate_image, MAX_FILE_SIZE_BYTES
from app.analysis.quality import compute_full_quality_report, compute_rgb_histograms
from app.stego.feature_map import compute_score_map, compute_bit_allocation_map
import cv2

router = APIRouter()

@router.post("/analyze")
async def analyze_endpoint(
    cover: UploadFile = File(...),
    stego: UploadFile = File(...),
    adaptive_config_id: int = 2,
):
    cover_data = await cover.read()
    stego_data = await stego.read()
    
    for data, name in [(cover_data, "cover"), (stego_data, "stego")]:
        if len(data) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(413, f"{name} image too large")
    
    try:
        cover_arr, cfmt, cw, ch = load_and_validate_image(cover_data)
        stego_arr, sfmt, sw, sh = load_and_validate_image(stego_data)
    except ValueError as e:
        raise HTTPException(422, str(e))
    
    if cover_arr.shape != stego_arr.shape:
        raise HTTPException(422, f"Image dimensions must match: {cw}x{ch} vs {sw}x{sh}")
    
    report = compute_full_quality_report(cover_arr, stego_arr)
    
    # Compute difference heatmap as base64
    diff = np.abs(cover_arr.astype(np.int16) - stego_arr.astype(np.int16)).astype(np.uint8)
    diff_amplified = np.clip(diff * 20, 0, 255).astype(np.uint8)
    if diff_amplified.max() == 0:
        diff_heatmap = np.zeros((ch, cw, 3), dtype=np.uint8)
    else:
        diff_gray = cv2.cvtColor(diff_amplified, cv2.COLOR_RGB2GRAY)
        diff_heatmap = cv2.applyColorMap(diff_gray, cv2.COLORMAP_HOT)
        diff_heatmap = cv2.cvtColor(diff_heatmap, cv2.COLOR_BGR2RGB)
    
    heatmap_pil = Image.fromarray(diff_heatmap)
    buf = io.BytesIO()
    heatmap_pil.save(buf, format='PNG')
    heatmap_b64 = base64.b64encode(buf.getvalue()).decode()
    
    # Score map
    score_map = compute_score_map(cover_arr, adaptive_config_id if adaptive_config_id in {1,2,3} else 2)
    score_visual = (score_map * 255).astype(np.uint8)
    score_color = cv2.applyColorMap(score_visual, cv2.COLORMAP_VIRIDIS)
    score_color = cv2.cvtColor(score_color, cv2.COLOR_BGR2RGB)
    score_pil = Image.fromarray(score_color)
    buf2 = io.BytesIO()
    score_pil.save(buf2, format='PNG')
    score_b64 = base64.b64encode(buf2.getvalue()).decode()
    
    # Edge map
    gray = cv2.cvtColor(cover_arr, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edge_pil = Image.fromarray(edges)
    buf3 = io.BytesIO()
    edge_pil.save(buf3, format='PNG')
    edge_b64 = base64.b64encode(buf3.getvalue()).decode()
    
    report["difference_heatmap_png_b64"] = heatmap_b64
    report["score_map_png_b64"] = score_b64
    report["edge_map_png_b64"] = edge_b64
    report["cover_format"] = cfmt
    report["stego_format"] = sfmt
    
    return report

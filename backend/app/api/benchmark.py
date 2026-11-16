from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import numpy as np, time, json
from app.stego.image_io import load_and_validate_image, MAX_FILE_SIZE_BYTES
from app.services.encode_service import encode
from app.services.decode_service import decode as decode_svc
from app.analysis.quality import compute_full_quality_report

router = APIRouter()

@router.post("/benchmark")
async def benchmark_endpoint(
    cover: UploadFile = File(...),
    payload_sizes_json: str = Form('["128", "512", "1024"]'),
    password: str = Form("benchmark-password-2024"),
    methods: str = Form("adaptive,sequential,permuted"),
):
    cover_data = await cover.read()
    if len(cover_data) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(413, "Cover too large")
    
    try:
        rgb, fmt, w, h = load_and_validate_image(cover_data)
    except ValueError as e:
        raise HTTPException(422, str(e))
    
    try:
        raw_sizes = [int(s) for s in json.loads(payload_sizes_json)]
        payload_sizes = [s for s in raw_sizes if 0 < s <= 50_000][:5]
        if not payload_sizes:
            payload_sizes = [128, 512, 1024]
    except Exception:
        payload_sizes = [128, 512, 1024]
    
    allowed_methods = {"adaptive", "sequential", "permuted"}
    method_list = [m.strip() for m in methods.split(",") if m.strip() in allowed_methods][:3]
    if not method_list:
        method_list = ["adaptive"]
    
    results = []
    
    for payload_size in payload_sizes:
        payload_data = bytes(range(payload_size % 256)) * (payload_size // 256 + 1)
        payload_data = payload_data[:payload_size]
        
        for method in method_list:
            config_id = {"adaptive": 2, "sequential": 2, "permuted": 2}.get(method, 2)
            
            try:
                t0 = time.time()
                zip_bytes, report = encode(
                    cover_image_bytes=cover_data,
                    payload_data=payload_data,
                    payload_type="file",
                    filename="benchmark.bin",
                    password=password,
                    adaptive_config_id=config_id,
                )
                encode_time = time.time() - t0
                
                # Extract stego PNG from zip
                import io, zipfile
                with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
                    stego_bytes = zf.read("stego.png")
                
                # Decode round-trip
                t1 = time.time()
                recovered, _, _, verif = decode_svc(stego_bytes, password)
                decode_time = time.time() - t1
                
                round_trip_ok = recovered == payload_data
                
                qm = report.get("quality_metrics", {})
                results.append({
                    "method": method,
                    "payload_bytes": payload_size,
                    "carrier_format": fmt,
                    "width": w,
                    "height": h,
                    "capacity_bits": report.get("total_capacity_bits", 0),
                    "payload_bits": report.get("payload_bits", 0),
                    "capacity_utilization": qm.get("capacity_utilization", 0),
                    "mse": qm.get("mse", 0),
                    "psnr": qm.get("psnr"),
                    "ssim": qm.get("ssim", 0),
                    "cover_entropy": qm.get("cover_entropy", 0),
                    "stego_entropy": qm.get("stego_entropy", 0),
                    "entropy_difference": qm.get("entropy_difference", 0),
                    "changed_pixels": qm.get("changed_pixels", 0),
                    "changed_pixels_ratio": qm.get("changed_pixels_ratio", 0),
                    "encode_time": encode_time,
                    "decode_time": decode_time,
                    "round_trip_ok": round_trip_ok,
                    "authentication_ok": verif.get("gcm_authenticated", False),
                    "integrity_ok": verif.get("sha256_digest_verified", False),
                    "status": "success",
                })
            except Exception as ex:
                results.append({
                    "method": method,
                    "payload_bytes": payload_size,
                    "carrier_format": fmt,
                    "width": w,
                    "height": h,
                    "status": "failed",
                    "error": str(ex),
                })
    
    return {"results": results}

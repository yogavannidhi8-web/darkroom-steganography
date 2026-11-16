import os
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from app.services.encode_service import encode
from app.stego.image_io import MAX_FILE_SIZE_BYTES

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/encode")
async def encode_endpoint(
    cover: UploadFile = File(...),
    payload_type: str = Form(...),
    password: str = Form(...),
    adaptive_config_id: int = Form(2),
    text_payload: str = Form(None),
    file_payload: UploadFile = File(None),
):
    cover_data = await cover.read()
    if len(cover_data) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(413, "Cover image too large")
    
    if not password or len(password) < 8:
        raise HTTPException(422, "Password must be at least 8 characters")
    
    if payload_type == "text":
        if not text_payload:
            raise HTTPException(422, "Text payload is required")
        payload_data = text_payload.encode("utf-8")
        filename = "message.txt"
    elif payload_type == "file":
        if file_payload is None:
            raise HTTPException(422, "File payload is required")
        payload_data = await file_payload.read()
        raw_name = file_payload.filename or "file.bin"
        filename = os.path.basename(raw_name).strip().lstrip(".") or "file.bin"
        if len(payload_data) > 10 * 1024 * 1024:
            raise HTTPException(413, "Secret file too large (max 10 MB)")
    else:
        raise HTTPException(422, f"Unknown payload_type: {payload_type!r}")
    
    if len(payload_data) == 0:
        raise HTTPException(422, "Payload cannot be empty")
    
    if adaptive_config_id not in {1, 2, 3}:
        adaptive_config_id = 2
    
    try:
        zip_bytes, report = encode(
            cover_image_bytes=cover_data,
            payload_data=payload_data,
            payload_type=payload_type,
            filename=filename,
            password=password,
            adaptive_config_id=adaptive_config_id,
        )
    except ValueError as e:
        err_str = str(e)
        if "INSUFFICIENT_CAPACITY" in err_str:
            raise HTTPException(422, {"error": {"code": "INSUFFICIENT_CAPACITY", "message": err_str.replace("INSUFFICIENT_CAPACITY: ", "")}})
        raise HTTPException(422, {"error": {"code": "ENCODE_ERROR", "message": err_str}})
    except Exception as e:
        logger.error(f"Encode error: {e}")
        raise HTTPException(500, {"error": {"code": "INTERNAL_ERROR", "message": "Encoding failed. Check server logs."}})
    
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=darkroom_result.zip"},
    )

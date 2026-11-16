from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from app.services.decode_service import decode
from app.stego.image_io import MAX_FILE_SIZE_BYTES
import os, io, json, zipfile, logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/decode")
async def decode_endpoint(
    stego: UploadFile = File(...),
    password: str = Form(...),
):
    stego_data = await stego.read()
    if len(stego_data) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(413, "Stego image too large")
    
    if not password:
        raise HTTPException(422, "Password is required")
    
    try:
        payload_bytes, payload_type, filename, verification = decode(
            stego_image_bytes=stego_data,
            password=password,
        )
    except ValueError as e:
        err_str = str(e)
        if "AUTHENTICATION_FAILED" in err_str:
            raise HTTPException(401, {"error": {"code": "AUTHENTICATION_FAILED", "message": "Authentication failed. Wrong password or image has been modified."}})
        elif "INTEGRITY_FAILED" in err_str:
            raise HTTPException(422, {"error": {"code": "INTEGRITY_FAILED", "message": str(e).replace("INTEGRITY_FAILED: ", "")}})
        elif "DIMENSION_MISMATCH" in err_str:
            raise HTTPException(422, {"error": {"code": "DIMENSION_MISMATCH", "message": str(e).replace("DIMENSION_MISMATCH: ", "")}})
        else:
            raise HTTPException(422, {"error": {"code": "DECODE_ERROR", "message": str(e)}})
    except Exception as e:
        logger.error(f"Decode error: {e}")
        raise HTTPException(500, {"error": {"code": "INTERNAL_ERROR", "message": "Decoding failed. Check server logs."}})
    
    # Package result
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        # Safe sanitized filename
        base = os.path.basename(filename).strip().lstrip(".") if filename else ""
        safe_name = base if base else ("recovered_message.txt" if payload_type == "text" else "recovered_file.bin")
        zf.writestr(safe_name, payload_bytes)
        zf.writestr("verification.json", json.dumps(verification, indent=2))
    
    return Response(
        content=buf.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=darkroom_decoded.zip"},
    )

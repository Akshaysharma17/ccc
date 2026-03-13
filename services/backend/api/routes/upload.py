from fastapi import APIRouter, UploadFile, File, HTTPException

from config.settings import settings
from db.mongo import get_db, ensure_indexes
from services.excel_parser import parse_excel

router = APIRouter()


@router.post("/api/upload")
async def upload_excel(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(400, "Only .xlsx files are accepted")

    contents = await file.read()
    if len(contents) > settings.max_upload_size:
        raise HTTPException(400, f"File too large. Max size: {settings.max_upload_size // (1024*1024)}MB")

    try:
        records = parse_excel(contents)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to parse Excel file: {e}")

    if not records:
        raise HTTPException(400, "No data rows found in the Excel file")

    db = get_db()
    await db.drop_collection("ccc_records")
    await db["ccc_records"].insert_many(records)
    await ensure_indexes()

    return {"status": "success", "records_inserted": len(records)}

from fastapi import APIRouter
from pydantic import BaseModel

from db.mongo import get_db

router = APIRouter()


class AnnotationUpdate(BaseModel):
    section_number: str
    serial_number: str
    person_name: str | None = None
    remarks: str | None = None


@router.get("/api/annotations/{section_number}")
async def get_annotations(section_number: str):
    """Get all saved annotations for a section."""
    db = get_db()
    coll = db["report_annotations"]
    cursor = coll.find({"section_number": section_number}, {"_id": 0})
    annotations = {}
    async for doc in cursor:
        key = doc["serial_number"]
        annotations[key] = {
            "person_name": doc.get("person_name", ""),
            "remarks": doc.get("remarks", ""),
        }
    return {"section_number": section_number, "annotations": annotations}


@router.patch("/api/annotations")
async def save_annotation(update: AnnotationUpdate):
    """Auto-save a single annotation (upsert)."""
    db = get_db()
    coll = db["report_annotations"]
    await coll.update_one(
        {
            "section_number": update.section_number,
            "serial_number": update.serial_number,
        },
        {
            "$set": {
                "section_number": update.section_number,
                "serial_number": update.serial_number,
                "person_name": update.person_name or "",
                "remarks": update.remarks or "",
            }
        },
        upsert=True,
    )
    return {"status": "saved"}

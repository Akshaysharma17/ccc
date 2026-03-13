from fastapi import APIRouter

from db.mongo import get_db

router = APIRouter()


@router.get("/api/report/{section_number}")
async def get_section_report(section_number: str):
    """Generate abstract report for a section, calculated on-the-fly from CCC data.

    Categories:
      1. Total – count only, no detail rows
      2. Submitted – count only, no detail rows
      3. To be submitted - Pending with – detail rows (non-submitted CCCs)
      4. Returned - Pending With – detail rows (submitted CCCs with returned_status)
      5. Approved with Comments – detail rows
      6. In Process With NPCIL – detail rows

    For categories 4-6, records are identified by the `returned_status` field
    (column AT in Excel) which holds the sub-status for submitted CCCs.
    The Status column in report items shows the KKS code.
    """
    db = get_db()
    coll = db["ccc_records"]

    cursor = coll.find({"section_number": section_number}, {"_id": 0})
    records = [doc async for doc in cursor]

    if not records:
        return {"section_number": section_number, "section_name": "", "total": 0,
                "summary": {"submitted": 0, "pending": 0, "approved": 0, "in_process": 0, "returned": 0},
                "kks_codes": [], "categories": []}

    section_name = records[0].get("section_name") or ""
    total = len(records)

    # Categorize entirely by returned_status (column AT)
    # AT blank → Pending (not yet submitted)
    # AT has value → Submitted, further split into sub-categories
    pending_all = []       # AT is blank
    returned_recs = []     # AT = "Returned"
    approved_comments_recs = []  # AT = "Approved With Comments"
    in_process_recs = []   # AT = "In Process with NPCIL"
    other_submitted = []   # AT has some other value (still counts as submitted)

    for rec in records:
        sub = (rec.get("returned_status") or "").strip()
        if not sub:
            # Column AT is blank → pending / not yet submitted
            pending_all.append(rec)
        else:
            sub_lower = sub.lower()
            if "return" in sub_lower:
                returned_recs.append(rec)
            elif "approved" in sub_lower and "comment" in sub_lower:
                approved_comments_recs.append(rec)
            elif "in process" in sub_lower or "npcil" in sub_lower:
                in_process_recs.append(rec)
            else:
                other_submitted.append(rec)

    submitted_all = returned_recs + approved_comments_recs + in_process_recs + other_submitted

    categories = []

    # 1. Total – count only
    categories.append({"sno": 1, "title": "Total", "count": total, "items": []})

    # 2. Submitted – count only
    categories.append({"sno": 2, "title": "Submitted", "count": len(submitted_all), "items": []})

    # 3. To be submitted - Pending with – detail rows
    categories.append({
        "sno": 3,
        "title": "To be submitted - Pending with",
        "count": len(pending_all),
        "items": _to_items(pending_all),
    })

    # 4. Returned - Pending With – detail rows
    categories.append({
        "sno": 4,
        "title": "Returned - Pending With",
        "count": len(returned_recs),
        "items": _to_items(returned_recs),
    })

    # 5. Approved with Comments – detail rows
    categories.append({
        "sno": 5,
        "title": "Approved with Comments",
        "count": len(approved_comments_recs),
        "items": _to_items(approved_comments_recs),
    })

    # 6. In Process With NPCIL – detail rows
    categories.append({
        "sno": 6,
        "title": "In Process With NPCIL",
        "count": len(in_process_recs),
        "items": _to_items(in_process_recs),
    })

    kks_codes = sorted(set(r.get("kks_code", "") for r in records if r.get("kks_code")))

    return {
        "section_number": section_number,
        "section_name": section_name,
        "kks_codes": kks_codes,
        "total": total,
        "summary": {
            "submitted": len(submitted_all),
            "pending": len(pending_all),
            "approved": len(approved_comments_recs),
            "in_process": len(in_process_recs),
            "returned": len(returned_recs),
        },
        "categories": categories,
    }


def _to_items(records: list[dict]) -> list[dict]:
    """Convert records to flat report items.

    Status column shows: Description (col P) - KKS code (col J)
    """
    items = []
    for rec in records:
        desc = rec.get("ccc_description") or ""
        kks = rec.get("kks_code") or ""
        # Status = "Description - KKS code"
        status_display = f"{desc} - {kks}" if desc and kks else desc or kks
        items.append({
            "serial_number": rec.get("serial_number") or "",
            "ccc_description": rec.get("ccc_description") or "",
            "kks_description": rec.get("kks_description") or "",
            "kks_code": rec.get("kks_code") or "",
            "ccc_number_full": rec.get("ccc_number_full") or "",
            "ccc_status": status_display,
        })
    return items

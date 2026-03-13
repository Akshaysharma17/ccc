import re

from fastapi import APIRouter

from db.mongo import get_db

router = APIRouter()


def _natural_sort_key(value: str) -> list:
    """Split string into text and numeric parts for natural sorting.
    '1.2' → [1, '.', 2], '1.10' → [1, '.', 10] so 1.2 < 1.10."""
    parts = re.split(r'(\d+)', value)
    return [int(p) if p.isdigit() else p.lower() for p in parts]


@router.get("/api/hierarchy/all")
async def get_hierarchy():
    db = get_db()
    coll = db["ccc_records"]

    cursor = coll.find({}, {"_id": 0})

    sections: dict[str, dict] = {}

    async for doc in cursor:
        sec_key = doc.get("section_number") or "Unknown"
        kks_key = doc.get("kks_code") or "Unknown"

        if sec_key not in sections:
            sections[sec_key] = {
                "section_number": sec_key,
                "section_name": doc.get("section_name") or "",
                "kks_groups": {},
                "count": 0,
            }

        section = sections[sec_key]
        section["count"] += 1

        if kks_key not in section["kks_groups"]:
            section["kks_groups"][kks_key] = {
                "kks_code": kks_key,
                "kks_description": doc.get("kks_description") or "",
                "cccs": [],
                "count": 0,
            }

        kks_group = section["kks_groups"][kks_key]
        kks_group["count"] += 1
        kks_group["cccs"].append(doc)

    # Convert kks_groups dict to list, sort naturally
    result = []
    for sec in sorted(sections.values(), key=lambda s: _natural_sort_key(s["section_number"])):
        sec["kks_groups"] = sorted(
            sec["kks_groups"].values(), key=lambda k: _natural_sort_key(k["kks_code"])
        )
        result.append(sec)

    return {"sections": result, "total": sum(s["count"] for s in result)}

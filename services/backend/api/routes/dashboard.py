from fastapi import APIRouter

from db.mongo import get_db

router = APIRouter()


@router.get("/api/dashboard/stats")
async def get_stats():
    db = get_db()
    coll = db["ccc_records"]

    total = await coll.count_documents({})
    if total == 0:
        return {
            "total": 0,
            "by_status": {},
            "by_department": {},
            "by_priority": {},
        }

    # Aggregate by status
    status_pipeline = [
        {"$group": {"_id": "$ccc_status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    status_cursor = coll.aggregate(status_pipeline)
    by_status = {doc["_id"]: doc["count"] async for doc in status_cursor}

    # Aggregate by department
    dept_pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    dept_cursor = coll.aggregate(dept_pipeline)
    by_department = {(doc["_id"] or "Unknown"): doc["count"] async for doc in dept_cursor}

    # Aggregate by priority
    priority_pipeline = [
        {"$group": {"_id": "$priority_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    priority_cursor = coll.aggregate(priority_pipeline)
    by_priority = {(doc["_id"] or "Unknown"): doc["count"] async for doc in priority_cursor}

    return {
        "total": total,
        "by_status": by_status,
        "by_department": by_department,
        "by_priority": by_priority,
    }

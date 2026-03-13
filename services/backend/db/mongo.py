from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config.settings import settings

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_mongo() -> None:
    global client, db
    client = AsyncIOMotorClient(settings.mongo_url)
    db = client[settings.mongo_db]
    await ensure_indexes()


async def close_mongo() -> None:
    global client
    if client:
        client.close()


async def ensure_indexes() -> None:
    if db is None:
        return
    coll = db["ccc_records"]
    await coll.create_index("section_number")
    await coll.create_index("kks_code")
    await coll.create_index("ccc_status")
    await coll.create_index("department")

    ann = db["report_annotations"]
    await ann.create_index(
        [("section_number", 1), ("serial_number", 1)], unique=True
    )


def get_db() -> AsyncIOMotorDatabase:
    if db is None:
        raise RuntimeError("Database not initialized")
    return db

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from db.mongo import connect_mongo, close_mongo
from api.routes.health import router as health_router
from api.routes.upload import router as upload_router
from api.routes.dashboard import router as dashboard_router
from api.routes.hierarchy import router as hierarchy_router
from api.routes.report import router as report_router
from api.routes.annotations import router as annotations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_mongo()
    yield
    await close_mongo()


app = FastAPI(title="CCC Status Dashboard API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(upload_router)
app.include_router(dashboard_router)
app.include_router(hierarchy_router)
app.include_router(report_router)
app.include_router(annotations_router)

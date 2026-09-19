import os
import sys
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import auth, contacts, companies, lists, sequences, enrichment, export

# Backend root directory (where seed_data.py lives)
BACKEND_DIR = Path(__file__).resolve().parent.parent

# Create all tables
Base.metadata.create_all(bind=engine)

# Auto-seed on first run
try:
    from app.core.database import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    if not db.query(User).first():
        db.close()
        print("No users found — running seed_data.py...")
        import subprocess
        result = subprocess.run(
            [sys.executable, str(BACKEND_DIR / "seed_data.py")],
            cwd=str(BACKEND_DIR),
            capture_output=True, text=True
        )
        print(f"Seed stdout: {result.stdout}")
        if result.stderr:
            print(f"Seed stderr: {result.stderr}")
    else:
        db.close()
        print("Database already seeded.")
except Exception as e:
    print(f"Auto-seed check failed: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Free B2B phone number & email finder — open-source Apollo alternative",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api")
app.include_router(contacts.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(lists.router, prefix="/api")
app.include_router(sequences.router, prefix="/api")
app.include_router(enrichment.router, prefix="/api")
app.include_router(export.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/api/stats")
def dashboard_stats():
    from app.core.database import SessionLocal
    from app.models.contact import Contact
    from app.models.company import Company
    from app.models.list import ContactList
    from app.models.sequence import Sequence

    db = SessionLocal()
    try:
        return {
            "total_contacts": db.query(Contact).count(),
            "total_companies": db.query(Company).count(),
            "contacts_with_email": db.query(Contact).filter(
                Contact.email.isnot(None), Contact.email != ""
            ).count(),
            "contacts_with_phone": db.query(Contact).filter(
                Contact.phone.isnot(None), Contact.phone != ""
            ).count(),
            "verified_emails": db.query(Contact).filter(
                Contact.email_status == "verified"
            ).count(),
            "total_lists": db.query(ContactList).count(),
            "total_sequences": db.query(Sequence).count(),
        }
    finally:
        db.close()


# --- Serve built frontend in production ---
STATIC_DIR = BACKEND_DIR / "static"
print(f"Static dir: {STATIC_DIR} (exists: {STATIC_DIR.exists()})")

if STATIC_DIR.exists():
    print(f"Static contents: {list(STATIC_DIR.iterdir())}")

    # Serve assets (JS, CSS, images)
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="static-assets")

    # Serve favicon
    @app.get("/favicon.svg")
    async def favicon():
        fav = STATIC_DIR / "favicon.svg"
        if fav.exists():
            return FileResponse(str(fav))

    # Root path — serve index.html
    @app.get("/")
    async def serve_root():
        return FileResponse(str(STATIC_DIR / "index.html"))

    # SPA fallback — any non-API route serves index.html
    @app.get("/{full_path:path}")
    async def spa_fallback(request: Request, full_path: str):
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json"):
            return
        file_path = STATIC_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(STATIC_DIR / "index.html"))
else:
    print("WARNING: Static directory not found — frontend will not be served.")

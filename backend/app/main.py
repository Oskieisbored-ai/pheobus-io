import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import auth, contacts, companies, lists, sequences, enrichment, export

# Create all tables
Base.metadata.create_all(bind=engine)

# Auto-seed on first run (production)
if settings.ENVIRONMENT == "production":
    try:
        from app.core.database import SessionLocal
        from app.models.user import User
        db = SessionLocal()
        if not db.query(User).first():
            db.close()
            import subprocess, sys
            subprocess.run([sys.executable, "seed_data.py"], cwd=os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        else:
            db.close()
    except Exception as e:
        print(f"Auto-seed check skipped: {e}")

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
STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "static"

if STATIC_DIR.exists():
    # Serve assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="static-assets")

    # Serve other static files (favicon, etc.)
    @app.get("/favicon.svg")
    async def favicon():
        return FileResponse(str(STATIC_DIR / "favicon.svg"))

    # SPA fallback — any non-API route serves index.html
    @app.get("/{full_path:path}")
    async def spa_fallback(request: Request, full_path: str):
        # Don't intercept API routes or docs
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json"):
            return
        file_path = STATIC_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(STATIC_DIR / "index.html"))

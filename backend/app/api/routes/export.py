from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import csv
import io
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.contact import Contact
from app.models.list import ListMember

router = APIRouter(prefix="/export", tags=["Export"])


class ExportRequest(BaseModel):
    contact_ids: Optional[List[int]] = None
    list_id: Optional[int] = None
    format: str = "csv"  # csv or xlsx
    fields: Optional[List[str]] = None


EXPORTABLE_FIELDS = [
    "first_name", "last_name", "full_name", "email", "email_status",
    "phone", "mobile_phone", "work_phone", "title", "seniority",
    "department", "company_name", "city", "state", "country",
    "linkedin_url", "twitter_url", "github_url",
]


@router.post("/contacts")
def export_contacts(
    req: ExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get contacts
    if req.contact_ids:
        contacts = db.query(Contact).filter(Contact.id.in_(req.contact_ids)).all()
    elif req.list_id:
        contacts = (
            db.query(Contact)
            .join(ListMember, ListMember.contact_id == Contact.id)
            .filter(ListMember.list_id == req.list_id)
            .all()
        )
    else:
        raise HTTPException(status_code=400, detail="Provide contact_ids or list_id")

    fields = req.fields or EXPORTABLE_FIELDS

    if req.format == "csv":
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=fields)
        writer.writeheader()
        for contact in contacts:
            row = {}
            for f in fields:
                row[f] = getattr(contact, f, "") or ""
            writer.writerow(row)

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=pheobus_contacts.csv"},
        )

    raise HTTPException(status_code=400, detail="Unsupported format")

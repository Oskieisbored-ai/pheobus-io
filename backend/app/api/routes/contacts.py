from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List
from math import ceil
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.contact import Contact
from app.models.company import Company
from app.schemas.contact import (
    ContactCreate, ContactUpdate, ContactResponse,
    ContactSearchFilters, PaginatedContacts, ContactBulkAction,
)

router = APIRouter(prefix="/contacts", tags=["Contacts"])


@router.get("", response_model=PaginatedContacts)
def search_contacts(
    q: Optional[str] = None,
    title: Optional[str] = None,
    company: Optional[str] = None,
    seniority: Optional[str] = None,
    department: Optional[str] = None,
    country: Optional[str] = None,
    location: Optional[str] = None,
    has_email: Optional[bool] = None,
    has_phone: Optional[bool] = None,
    email_status: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Contact)

    # Text search across name, email, title, company
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                Contact.full_name.ilike(search_term),
                Contact.first_name.ilike(search_term),
                Contact.last_name.ilike(search_term),
                Contact.email.ilike(search_term),
                Contact.title.ilike(search_term),
                Contact.company_name.ilike(search_term),
            )
        )

    if title:
        query = query.filter(Contact.title.ilike(f"%{title}%"))
    if company:
        query = query.filter(Contact.company_name.ilike(f"%{company}%"))
    if seniority:
        seniority_list = seniority.split(",")
        query = query.filter(Contact.seniority.in_(seniority_list))
    if department:
        dept_list = department.split(",")
        query = query.filter(Contact.department.in_(dept_list))
    if country:
        query = query.filter(Contact.country.ilike(f"%{country}%"))
    if location:
        loc_term = f"%{location}%"
        query = query.filter(
            or_(
                Contact.city.ilike(loc_term),
                Contact.state.ilike(loc_term),
                Contact.country.ilike(loc_term),
            )
        )
    if has_email is True:
        query = query.filter(Contact.email.isnot(None), Contact.email != "")
    if has_phone is True:
        query = query.filter(Contact.phone.isnot(None), Contact.phone != "")
    if email_status:
        query = query.filter(Contact.email_status == email_status)

    total = query.count()

    # Sorting
    sort_col = getattr(Contact, sort_by, Contact.created_at)
    if sort_order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    contacts = query.offset((page - 1) * per_page).limit(per_page).all()

    return PaginatedContacts(
        contacts=[ContactResponse.model_validate(c) for c in contacts],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=ceil(total / per_page) if total > 0 else 0,
    )


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return ContactResponse.model_validate(contact)


@router.post("", response_model=ContactResponse, status_code=201)
def create_contact(
    req: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = Contact(
        **req.model_dump(),
        full_name=f"{req.first_name} {req.last_name}",
        source="manual",
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return ContactResponse.model_validate(contact)


@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: int,
    req: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)

    if "first_name" in update_data or "last_name" in update_data:
        contact.full_name = f"{contact.first_name} {contact.last_name}"

    db.commit()
    db.refresh(contact)
    return ContactResponse.model_validate(contact)


@router.delete("/{contact_id}", status_code=204)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(contact)
    db.commit()


@router.post("/bulk", status_code=200)
def bulk_action(
    req: ContactBulkAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if req.action == "delete":
        db.query(Contact).filter(Contact.id.in_(req.contact_ids)).delete(
            synchronize_session=False
        )
        db.commit()
        return {"message": f"Deleted {len(req.contact_ids)} contacts"}

    if req.action == "add_to_list":
        from app.models.list import ListMember
        if not req.target_id:
            raise HTTPException(status_code=400, detail="target_id (list_id) required")
        for cid in req.contact_ids:
            existing = db.query(ListMember).filter(
                ListMember.list_id == req.target_id,
                ListMember.contact_id == cid,
            ).first()
            if not existing:
                db.add(ListMember(list_id=req.target_id, contact_id=cid))
        db.commit()
        return {"message": f"Added {len(req.contact_ids)} contacts to list"}

    return {"message": "Action processed"}

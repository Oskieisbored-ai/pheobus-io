from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List as TypingList
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.list import ContactList, ListMember
from app.models.contact import Contact
from app.schemas.list import ListCreate, ListUpdate, ListResponse, AddToListRequest, RemoveFromListRequest
from app.schemas.contact import ContactResponse

router = APIRouter(prefix="/lists", tags=["Lists"])


@router.get("", response_model=TypingList[ListResponse])
def get_lists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lists = db.query(ContactList).filter(ContactList.owner_id == current_user.id).all()
    result = []
    for lst in lists:
        lst.contact_count = db.query(ListMember).filter(ListMember.list_id == lst.id).count()
        result.append(ListResponse.model_validate(lst))
    return result


@router.post("", response_model=ListResponse, status_code=201)
def create_list(
    req: ListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_list = ContactList(**req.model_dump(), owner_id=current_user.id)
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return ListResponse.model_validate(new_list)


@router.get("/{list_id}", response_model=ListResponse)
def get_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lst = db.query(ContactList).filter(
        ContactList.id == list_id,
        ContactList.owner_id == current_user.id,
    ).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    lst.contact_count = db.query(ListMember).filter(ListMember.list_id == lst.id).count()
    return ListResponse.model_validate(lst)


@router.put("/{list_id}", response_model=ListResponse)
def update_list(
    list_id: int,
    req: ListUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lst = db.query(ContactList).filter(
        ContactList.id == list_id,
        ContactList.owner_id == current_user.id,
    ).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(lst, field, value)
    db.commit()
    db.refresh(lst)
    return ListResponse.model_validate(lst)


@router.delete("/{list_id}", status_code=204)
def delete_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lst = db.query(ContactList).filter(
        ContactList.id == list_id,
        ContactList.owner_id == current_user.id,
    ).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    db.delete(lst)
    db.commit()


@router.get("/{list_id}/contacts")
def get_list_contacts(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lst = db.query(ContactList).filter(
        ContactList.id == list_id,
        ContactList.owner_id == current_user.id,
    ).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    members = (
        db.query(Contact)
        .join(ListMember, ListMember.contact_id == Contact.id)
        .filter(ListMember.list_id == list_id)
        .all()
    )
    return {
        "contacts": [ContactResponse.model_validate(c) for c in members],
        "total": len(members),
    }


@router.post("/{list_id}/contacts")
def add_contacts_to_list(
    list_id: int,
    req: AddToListRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lst = db.query(ContactList).filter(
        ContactList.id == list_id,
        ContactList.owner_id == current_user.id,
    ).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    added = 0
    for cid in req.contact_ids:
        existing = db.query(ListMember).filter(
            ListMember.list_id == list_id,
            ListMember.contact_id == cid,
        ).first()
        if not existing:
            db.add(ListMember(list_id=list_id, contact_id=cid))
            added += 1
    db.commit()
    return {"added": added}


@router.delete("/{list_id}/contacts")
def remove_contacts_from_list(
    list_id: int,
    req: RemoveFromListRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(ListMember).filter(
        ListMember.list_id == list_id,
        ListMember.contact_id.in_(req.contact_ids),
    ).delete(synchronize_session=False)
    db.commit()
    return {"removed": len(req.contact_ids)}

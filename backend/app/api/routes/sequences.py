from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List as TypingList
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.sequence import Sequence, SequenceStep, SequenceEnrollment
from app.schemas.sequence import (
    SequenceCreate, SequenceUpdate, SequenceResponse,
    SequenceStepCreate, EnrollContactsRequest,
)

router = APIRouter(prefix="/sequences", tags=["Sequences"])


@router.get("", response_model=TypingList[SequenceResponse])
def get_sequences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    seqs = db.query(Sequence).filter(Sequence.owner_id == current_user.id).all()
    return [SequenceResponse.model_validate(s) for s in seqs]


@router.post("", response_model=SequenceResponse, status_code=201)
def create_sequence(
    req: SequenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    seq = Sequence(
        name=req.name,
        description=req.description,
        owner_id=current_user.id,
        send_window_start=req.send_window_start,
        send_window_end=req.send_window_end,
        send_days=req.send_days,
        track_opens=req.track_opens,
        track_clicks=req.track_clicks,
        stop_on_reply=req.stop_on_reply,
    )
    db.add(seq)
    db.flush()

    for i, step_data in enumerate(req.steps):
        step = SequenceStep(
            sequence_id=seq.id,
            order=i,
            **step_data.model_dump(),
        )
        db.add(step)

    db.commit()
    db.refresh(seq)
    return SequenceResponse.model_validate(seq)


@router.get("/{sequence_id}", response_model=SequenceResponse)
def get_sequence(
    sequence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    seq = db.query(Sequence).filter(
        Sequence.id == sequence_id,
        Sequence.owner_id == current_user.id,
    ).first()
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")
    return SequenceResponse.model_validate(seq)


@router.put("/{sequence_id}", response_model=SequenceResponse)
def update_sequence(
    sequence_id: int,
    req: SequenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    seq = db.query(Sequence).filter(
        Sequence.id == sequence_id,
        Sequence.owner_id == current_user.id,
    ).first()
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")

    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(seq, field, value)
    db.commit()
    db.refresh(seq)
    return SequenceResponse.model_validate(seq)


@router.delete("/{sequence_id}", status_code=204)
def delete_sequence(
    sequence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    seq = db.query(Sequence).filter(
        Sequence.id == sequence_id,
        Sequence.owner_id == current_user.id,
    ).first()
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")
    db.delete(seq)
    db.commit()


@router.post("/{sequence_id}/steps", response_model=SequenceResponse)
def add_step(
    sequence_id: int,
    req: SequenceStepCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    seq = db.query(Sequence).filter(
        Sequence.id == sequence_id,
        Sequence.owner_id == current_user.id,
    ).first()
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")

    max_order = db.query(SequenceStep).filter(
        SequenceStep.sequence_id == sequence_id
    ).count()

    step = SequenceStep(
        sequence_id=sequence_id,
        order=max_order,
        **req.model_dump(),
    )
    db.add(step)
    db.commit()
    db.refresh(seq)
    return SequenceResponse.model_validate(seq)


@router.post("/{sequence_id}/enroll")
def enroll_contacts(
    sequence_id: int,
    req: EnrollContactsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    seq = db.query(Sequence).filter(
        Sequence.id == sequence_id,
        Sequence.owner_id == current_user.id,
    ).first()
    if not seq:
        raise HTTPException(status_code=404, detail="Sequence not found")

    enrolled = 0
    for cid in req.contact_ids:
        existing = db.query(SequenceEnrollment).filter(
            SequenceEnrollment.sequence_id == sequence_id,
            SequenceEnrollment.contact_id == cid,
            SequenceEnrollment.status == "active",
        ).first()
        if not existing:
            enrollment = SequenceEnrollment(
                sequence_id=sequence_id,
                contact_id=cid,
            )
            db.add(enrollment)
            enrolled += 1

    seq.total_enrolled = (seq.total_enrolled or 0) + enrolled
    db.commit()
    return {"enrolled": enrolled}

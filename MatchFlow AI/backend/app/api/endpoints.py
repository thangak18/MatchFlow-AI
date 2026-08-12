import os
import tempfile
from typing import List
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import func, text
from sqlalchemy.orm import Session
from pypdf import PdfReader

from app.db.models import AvailabilitySlot, Investor, Match, Meeting, Startup, StartupProfile, StartupAvailability, InvestorAvailability
from app.db.session import get_db
from app.schemas.schemas import InvestorSchema, StartupProfileSchema, StartupSchema, MatchResult, InvestorProfileSchema, ParticipantAvailabilityUpdate
from app.services.ai_service import extract_startup_profile, generate_embedding
from app.services.matching_service import calculate_hybrid_match
from app.services.scheduling_service import generate_schedule

router = APIRouter()

@router.get("/startups", response_model=list[StartupSchema])
def get_startups(db: Session = Depends(get_db)):
    return db.query(Startup).all()

@router.post("/startups/register", response_model=StartupSchema)
def register_startup(profile: StartupProfileSchema, db: Session = Depends(get_db)):
    from app.db.models import User
    # create a dummy user
    new_user = User(email=f"temp_{uuid4()}@example.com", role="startup")
    db.add(new_user)
    db.flush()
    
    new_startup = Startup(user_id=new_user.id, company_name=profile.company_name or "Extracted Startup")
    db.add(new_startup)
    db.flush()
    
    # exclude id so it gets auto-generated
    profile_data = profile.model_dump(exclude={"id", "company_name"}, exclude_unset=True)
    new_profile = StartupProfile(startup_id=new_startup.id, **profile_data)
    db.add(new_profile)
    db.commit()
    db.refresh(new_startup)
    return new_startup

@router.get("/startups/{startup_id}", response_model=StartupSchema)
def get_startup(startup_id: UUID, db: Session = Depends(get_db)):
    startup = db.query(Startup).filter(Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
    return startup

@router.put("/startups/{startup_id}/profile", response_model=StartupProfileSchema)
def update_startup_profile(startup_id: UUID, profile: StartupProfileSchema, db: Session = Depends(get_db)):
    db_profile = db.query(StartupProfile).filter(StartupProfile.startup_id == startup_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for key, value in profile.model_dump(exclude_unset=True).items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.get("/startups/{startup_id}/availability")
def get_startup_availability(startup_id: UUID, db: Session = Depends(get_db)):
    slots = db.query(AvailabilitySlot).order_by(AvailabilitySlot.start_time).all()
    availability = db.query(StartupAvailability).filter(StartupAvailability.startup_id == startup_id).all()
    avail_map = {a.time_slot_id: a.is_available for a in availability}
    
    result = []
    for slot in slots:
        result.append({
            "time_slot_id": str(slot.id),
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "available": avail_map.get(slot.id, True) # Default True if no record
        })
    return {"status": "success", "availability": result}

@router.put("/startups/{startup_id}/availability")
def update_startup_availability(startup_id: UUID, update_data: ParticipantAvailabilityUpdate, db: Session = Depends(get_db)):
    for slot_data in update_data.slots:
        avail = db.query(StartupAvailability).filter(
            StartupAvailability.startup_id == startup_id,
            StartupAvailability.time_slot_id == slot_data.time_slot_id
        ).first()
        if avail:
            avail.is_available = slot_data.available
        else:
            db.add(StartupAvailability(
                startup_id=startup_id,
                time_slot_id=slot_data.time_slot_id,
                is_available=slot_data.available
            ))
    db.commit()
    return {"status": "success"}

@router.post("/startups/upload_pitch_deck", response_model=StartupProfileSchema)
def upload_pitch_deck(file: UploadFile = File(...)):
    if file.content_type != "application/pdf" or not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=415, detail="Only PDF pitch decks are supported.")
    contents = file.file.read(10 * 1024 * 1024 + 1)
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Pitch deck must be 10MB or smaller.")
    if not contents.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Invalid PDF file.")
    file_location = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
            temp_file.write(contents)
            file_location = temp_file.name
        try:
            reader = PdfReader(file_location)
            if not reader.pages:
                raise ValueError("PDF has no pages")
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file.") from exc
        profile = extract_startup_profile(file_location)
    finally:
        if file_location and os.path.exists(file_location):
            os.remove(file_location)
    
    if profile is None:
        raise HTTPException(status_code=500, detail="AI Extraction failed or produced invalid JSON.")
        
    return profile

@router.get("/investors", response_model=list[InvestorSchema])
def get_investors(db: Session = Depends(get_db)):
    return db.query(Investor).all()

@router.get("/investors/{investor_id}", response_model=InvestorSchema)
def get_investor(investor_id: UUID, db: Session = Depends(get_db)):
    investor = db.query(Investor).filter(Investor.id == investor_id).first()
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    return investor

@router.get("/investors/{investor_id}/availability")
def get_investor_availability(investor_id: UUID, db: Session = Depends(get_db)):
    slots = db.query(AvailabilitySlot).order_by(AvailabilitySlot.start_time).all()
    availability = db.query(InvestorAvailability).filter(InvestorAvailability.investor_id == investor_id).all()
    avail_map = {a.time_slot_id: a.is_available for a in availability}
    
    result = []
    for slot in slots:
        result.append({
            "time_slot_id": str(slot.id),
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "available": avail_map.get(slot.id, True) # Default True if no record
        })
    return {"status": "success", "availability": result}

@router.put("/investors/{investor_id}/availability")
def update_investor_availability(investor_id: UUID, update_data: ParticipantAvailabilityUpdate, db: Session = Depends(get_db)):
    for slot_data in update_data.slots:
        avail = db.query(InvestorAvailability).filter(
            InvestorAvailability.investor_id == investor_id,
            InvestorAvailability.time_slot_id == slot_data.time_slot_id
        ).first()
        if avail:
            avail.is_available = slot_data.available
        else:
            db.add(InvestorAvailability(
                investor_id=investor_id,
                time_slot_id=slot_data.time_slot_id,
                is_available=slot_data.available
            ))
    db.commit()
    return {"status": "success"}

@router.post("/startups/{startup_id}/match", response_model=List[MatchResult])
def generate_matches(startup_id: UUID, db: Session = Depends(get_db)):
    # Serialize repeated UI requests for the same startup so upserts cannot race.
    db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:startup_id))"), {"startup_id": str(startup_id)})
    startup = db.query(Startup).filter(Startup.id == startup_id).first()
    profile_db = db.query(StartupProfile).filter(StartupProfile.startup_id == startup_id).first()
    if not startup or not startup.profile:
        # In a real app we'd fetch profile from StartupProfile table if it's a relationship. 
        # Assuming DB model has it linked, but we'll manually query here to be safe:
        if not profile_db:
            raise HTTPException(status_code=404, detail="Startup Profile not found")
        startup_profile = StartupProfileSchema.model_validate(profile_db)
    else:
        startup_profile = StartupProfileSchema.model_validate(startup.profile)

    investors = db.query(Investor).all()
    candidates = []
    startup_embedding = list(profile_db.embedding) if profile_db.embedding is not None else None
    if startup_embedding is None and startup_profile.description:
        generated = generate_embedding(startup_profile.description)
        if any(generated):
            startup_embedding = generated
            profile_db.embedding = generated
    
    for investor in investors:
        if not investor.profile:
            continue
            
        investor_profile = InvestorProfileSchema.model_validate(investor.profile)
        investor_embedding = list(investor.profile.embedding) if investor.profile.embedding is not None else None
        preliminary = calculate_hybrid_match(
            startup=startup_profile,
            investor=investor_profile,
            startup_embedding=startup_embedding,
            investor_embedding=investor_embedding,
            use_llm_reasoning=False,
        )
        candidates.append((investor, investor_profile, investor_embedding, preliminary))

    top_three_ids = {
        candidate[0].id
        for candidate in sorted(candidates, key=lambda item: item[3]["final_score"], reverse=True)[:3]
    }
    results = []
    for investor, investor_profile, investor_embedding, preliminary in candidates:
        match_data = preliminary
        if investor.id in top_three_ids:
            match_data = calculate_hybrid_match(
                startup=startup_profile,
                investor=investor_profile,
                startup_embedding=startup_embedding,
                investor_embedding=investor_embedding,
                use_llm_reasoning=True,
            )
        match = db.query(Match).filter(
            Match.startup_id == startup_id,
            Match.investor_id == investor.id,
        ).first() or Match(startup_id=startup_id, investor_id=investor.id)
        for field in ("structured_score", "semantic_score", "llm_score", "final_score", "strengths", "risks", "explanation"):
            setattr(match, field, match_data[field])
        db.add(match)
        db.flush()
        results.append({
            "id": match.id,
            "startup_id": startup_id,
            "investor_id": investor.id,
            "investor_name": investor.investor_name,
            **match_data
        })
    db.commit()
    results.sort(key=lambda x: x["final_score"], reverse=True)
    return results

@router.get("/matches/{match_id}", response_model=MatchResult)
def get_match(match_id: UUID, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    investor = db.query(Investor).filter(Investor.id == match.investor_id).one()
    return MatchResult(
        id=match.id, startup_id=match.startup_id, investor_id=match.investor_id,
        investor_name=investor.investor_name, structured_score=float(match.structured_score),
        semantic_score=float(match.semantic_score) if match.semantic_score is not None else None,
        llm_score=float(match.llm_score) if match.llm_score is not None else None,
        final_score=float(match.final_score), strengths=match.strengths or [], risks=match.risks or [],
        explanation=match.explanation or "",
    )

@router.post("/schedule/generate")
def create_schedule(db: Session = Depends(get_db)):
    matches = db.query(Match).all()
    if not matches:
        raise HTTPException(status_code=409, detail="Generate matches before scheduling.")
    investor_names = {i.id: i.investor_name for i in db.query(Investor).all()}
    all_matches = [MatchResult(
        id=m.id, startup_id=m.startup_id, investor_id=m.investor_id,
        investor_name=investor_names[m.investor_id], structured_score=float(m.structured_score),
        semantic_score=float(m.semantic_score) if m.semantic_score is not None else None,
        llm_score=float(m.llm_score) if m.llm_score is not None else None,
        final_score=float(m.final_score), strengths=m.strengths or [], risks=m.risks or [],
        explanation=m.explanation or "",
    ) for m in matches]
    slots = db.query(AvailabilitySlot).order_by(AvailabilitySlot.start_time).all()
    if not slots:
        raise HTTPException(status_code=409, detail="No event time slots configured.")
    slot_index_map = {s.id: idx for idx, s in enumerate(slots)}
    
    # Fetch availability rules
    startup_unavail = set()
    investor_unavail = set()
    
    startup_avail_rows = db.query(StartupAvailability).all()
    for row in startup_avail_rows:
        if not row.is_available and row.time_slot_id in slot_index_map:
            startup_unavail.add((row.startup_id, slot_index_map[row.time_slot_id]))
            
    investor_avail_rows = db.query(InvestorAvailability).all()
    for row in investor_avail_rows:
        if not row.is_available and row.time_slot_id in slot_index_map:
            investor_unavail.add((row.investor_id, slot_index_map[row.time_slot_id]))

    schedule = generate_schedule(
        all_matches, 
        num_slots=len(slots), 
        max_meetings_per_startup=3, 
        max_meetings_per_investor=5,
        startup_unavailability=startup_unavail,
        investor_unavailability=investor_unavail
    )
    db.query(Meeting).delete()
    meetings_to_return = []
    for item in schedule:
        new_meeting = Meeting(match_id=item["match_id"], slot_id=slots[item["time_slot"]].id)
        db.add(new_meeting)
        db.flush()
        item["meeting_id"] = str(new_meeting.id)
        item["status"] = new_meeting.status
        item["outcome"] = new_meeting.outcome
        meetings_to_return.append(item)
    db.commit()
    return {"status": "success", "schedule": meetings_to_return, "meetings_created": len(meetings_to_return),
            "average_match_score": round(sum(item["match_score"] for item in meetings_to_return) / len(meetings_to_return), 2) if meetings_to_return else 0,
            "objective_value": round(sum(item["match_score"] for item in meetings_to_return), 2)}

@router.get("/schedule")
def get_schedule(db: Session = Depends(get_db)):
    meetings = db.query(Meeting).all()
    slots = db.query(AvailabilitySlot).order_by(AvailabilitySlot.start_time).all()
    slot_index_map = {s.id: idx for idx, s in enumerate(slots)}
    
    schedule = []
    for m in meetings:
        match = db.query(Match).filter(Match.id == m.match_id).first()
        if not match: continue
        schedule.append({
            "meeting_id": str(m.id),
            "startup_id": str(match.startup_id),
            "investor_id": str(match.investor_id),
            "time_slot": slot_index_map.get(m.slot_id, 0),
            "match_score": float(match.final_score),
            "status": m.status,
            "outcome": m.outcome
        })
    return {"status": "success", "schedule": schedule}

@router.patch("/meetings/{meeting_id}/outcome")
def record_meeting_outcome(meeting_id: UUID, outcome_data: dict, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    outcome = outcome_data.get("outcome")
    valid_outcomes = ["interested", "follow_up", "deal_discussion", "not_fit"]
    if outcome not in valid_outcomes:
        raise HTTPException(status_code=400, detail="Invalid outcome value")
        
    meeting.outcome = outcome
    meeting.status = "completed"
    meeting.notes = outcome_data.get("notes")
    meeting.next_step = outcome_data.get("next_step")
    meeting.follow_up_date = outcome_data.get("follow_up_date")
    meeting.completed_at = func.now()
    
    db.commit()
    db.refresh(meeting)
    return {"status": "success", "meeting_id": str(meeting.id), "outcome": meeting.outcome}

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    startups_count = db.query(Startup).count()
    investors_count = db.query(Investor).count()
    match_count = db.query(Match).count()
    meeting_count = db.query(Meeting).count()
    average = db.query(func.avg(Match.final_score)).scalar()
    
    # Outcome metrics
    completed_meetings = db.query(Meeting).filter(Meeting.status == "completed").count()
    follow_ups = db.query(Meeting).filter(Meeting.outcome == "follow_up").count()
    deal_discussions = db.query(Meeting).filter(Meeting.outcome == "deal_discussion").count()
    interested = db.query(Meeting).filter(Meeting.outcome == "interested").count()
    not_fit = db.query(Meeting).filter(Meeting.outcome == "not_fit").count()
    
    positive_interest_count = interested + follow_ups + deal_discussions
    positive_interest_rate = (positive_interest_count / completed_meetings * 100) if completed_meetings > 0 else 0.0

    return {
        "total_startups": startups_count,
        "total_investors": investors_count,
        "active_matches": match_count,
        "total_meetings": meeting_count,
        "average_match_score": round(float(average), 2) if average is not None else 0.0,
        "system_status": "Healthy",
        "completed_meetings": completed_meetings,
        "positive_interest_rate": round(positive_interest_rate, 1),
        "outcomes": {
            "interested": interested,
            "follow_ups_required": follow_ups,
            "deal_discussions": deal_discussions,
            "not_a_fit": not_fit
        }
    }

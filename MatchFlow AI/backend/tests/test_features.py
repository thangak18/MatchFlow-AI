import pytest
from uuid import uuid4
from app.db.models import Match, Meeting, AvailabilitySlot, StartupAvailability, InvestorAvailability
from app.services.scheduling_service import generate_schedule
from app.schemas.schemas import MatchResult

def test_outcome_tracking_db_schema():
    m = Meeting(
        match_id=uuid4(),
        slot_id=uuid4(),
        status="scheduled",
        outcome="interested",
        notes="Testing notes"
    )
    assert m.status == "scheduled"
    assert m.outcome == "interested"
    assert m.notes == "Testing notes"

def test_scheduling_availability_constraints():
    s1 = uuid4()
    s2 = uuid4()
    i1 = uuid4()
    i2 = uuid4()
    
    matches = [
        MatchResult(id=uuid4(), startup_id=s1, investor_id=i1, investor_name="I1", final_score=90.0, strengths=[], risks=[]),
        MatchResult(id=uuid4(), startup_id=s2, investor_id=i2, investor_name="I2", final_score=80.0, strengths=[], risks=[])
    ]
    
    # 2 slots available
    # s1 is unavailable for slot 0
    # i2 is unavailable for slot 1
    
    startup_unavail = {(s1, 0)}
    investor_unavail = {(i2, 1)}
    
    schedule = generate_schedule(
        matches=matches,
        num_slots=2,
        max_meetings_per_startup=1,
        max_meetings_per_investor=1,
        startup_unavailability=startup_unavail,
        investor_unavailability=investor_unavail
    )
    
    # Schedule should produce 2 meetings
    assert len(schedule) == 2
    
    for meeting in schedule:
        if meeting["startup_id"] == s1:
            assert meeting["time_slot"] != 0 # s1 cannot meet at slot 0
            assert meeting["time_slot"] == 1
        if meeting["startup_id"] == s2:
            assert meeting["time_slot"] != 1 # because i2 is unavailable at slot 1, s2 and i2 must meet at slot 0
            assert meeting["time_slot"] == 0

def test_scheduling_default_available():
    s1 = uuid4()
    i1 = uuid4()
    
    matches = [
        MatchResult(id=uuid4(), startup_id=s1, investor_id=i1, investor_name="I1", final_score=90.0, strengths=[], risks=[])
    ]
    
    # Empty unavailability sets = implicitly available for all slots
    schedule = generate_schedule(
        matches=matches,
        num_slots=1,
        max_meetings_per_startup=1,
        max_meetings_per_investor=1,
        startup_unavailability=set(),
        investor_unavailability=set()
    )
    
    assert len(schedule) == 1
    assert schedule[0]["time_slot"] == 0

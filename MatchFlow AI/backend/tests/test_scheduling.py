import pytest
import uuid
from app.schemas.schemas import MatchResult
from app.services.scheduling_service import generate_schedule

def test_scheduling_no_overlaps():
    # Setup test matches
    s1 = uuid.uuid4()
    s2 = uuid.uuid4()
    i1 = uuid.uuid4()
    
    # Both startups matched to the SAME investor
    m1 = MatchResult(
        id=uuid.uuid4(),
        startup_id=s1,
        investor_id=i1,
        investor_name="Inv1",
        final_score=90.0,
        strengths=[],
        risks=[]
    )
    m2 = MatchResult(
        id=uuid.uuid4(),
        startup_id=s2,
        investor_id=i1,
        investor_name="Inv1",
        final_score=80.0,
        strengths=[],
        risks=[]
    )
    
    # Generate schedule for 1 slot
    schedule = generate_schedule([m1, m2], num_slots=1, max_meetings_per_startup=1, max_meetings_per_investor=1)
    
    # Constraint test: Investor i1 can only have ONE meeting in slot 0.
    assert len(schedule) == 1
    
    # Objective test: The solver should prioritize the higher score (m1: 90.0 > m2: 80.0)
    assert schedule[0]["startup_id"] == s1
    assert schedule[0]["match_score"] == 90.0
    
def test_scheduling_all_assigned():
    # Setup 2 startups, 2 investors, perfectly disjoint max score
    s1 = uuid.uuid4()
    i1 = uuid.uuid4()
    s2 = uuid.uuid4()
    i2 = uuid.uuid4()
    
    matches = [
        MatchResult(id=uuid.uuid4(), startup_id=s1, investor_id=i1, investor_name="I1", final_score=95.0, strengths=[], risks=[]),
        MatchResult(id=uuid.uuid4(), startup_id=s2, investor_id=i2, investor_name="I2", final_score=90.0, strengths=[], risks=[])
    ]
    
    schedule = generate_schedule(matches, num_slots=2, max_meetings_per_startup=2, max_meetings_per_investor=2)
    
    # Both should be scheduled because they don't overlap (different startups, different investors)
    assert len(schedule) == 2

from app.db.models import (
    AvailabilitySlot,
    Event,
    Investor,
    InvestorProfile,
    Match,
    Meeting,
    Startup,
    StartupProfile,
    User,
)
from app.schemas.schemas import StartupSchema


def test_models_importable():
    # If this test runs, it means the SQLAlchemy models have no syntax errors
    assert User.__tablename__ == 'users'
    assert Event.__tablename__ == 'events'
    assert Startup.__tablename__ == 'startups'
    assert StartupProfile.__tablename__ == 'startup_profiles'
    assert Investor.__tablename__ == 'investors'
    assert InvestorProfile.__tablename__ == 'investor_profiles'
    assert Match.__tablename__ == 'matches'
    assert AvailabilitySlot.__tablename__ == 'availability_slots'
    assert Meeting.__tablename__ == 'meetings'




def test_schemas_valid():
    # Test Pydantic schemas can be instantiated
    s = StartupSchema(
        id="123e4567-e89b-12d3-a456-426614174000",
        user_id="123e4567-e89b-12d3-a456-426614174001",
        company_name="LogiSense AI"
    )
    assert s.company_name == "LogiSense AI"

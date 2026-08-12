"""Reset, seed, embed, and verify the configured local demo database."""

import os
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

ROOT = Path(__file__).resolve().parents[3]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))
load_dotenv(BACKEND / ".env")

from app.db.models import InvestorProfile, StartupProfile  # noqa: E402
from app.services.ai_service import generate_embedding  # noqa: E402


def fail(message: str) -> None:
    raise SystemExit(f"DEMO BOOTSTRAP FAILED: {message}")


def main() -> None:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        fail("DATABASE_URL is not configured")
    if not (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
        fail("Gemini credentials are not configured")

    url = make_url(database_url)
    if not url.database:
        fail("DATABASE_URL must include a database name")

    admin_url = url.set(drivername="postgresql", database="postgres")
    with psycopg2.connect(admin_url.render_as_string(hide_password=False)) as admin:
        admin.autocommit = True
        with admin.cursor() as cursor:
            cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (url.database,))
            if cursor.fetchone() is None:
                cursor.execute(f'CREATE DATABASE "{url.database.replace(chr(34), chr(34) * 2)}"')

    migration = (ROOT / "supabase/migrations/20260812_init_schema.sql").read_text()
    seed = (ROOT / "supabase/seed.sql").read_text()
    with psycopg2.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
            cursor.execute(migration)
            cursor.execute(seed)
        connection.commit()

    engine = create_engine(database_url)
    with Session(engine) as db:
        startup_profiles = db.query(StartupProfile).all()
        investor_profiles = db.query(InvestorProfile).all()
        for profile in startup_profiles:
            if not profile.description:
                fail(f"Startup profile {profile.id} has no description to embed")
            vector = generate_embedding(profile.description)
            if len(vector) != 768 or not any(vector):
                fail(f"Startup embedding generation failed for profile {profile.id}")
            profile.embedding = vector
        for profile in investor_profiles:
            if not profile.investment_thesis:
                fail(f"Investor profile {profile.id} has no thesis to embed")
            vector = generate_embedding(profile.investment_thesis)
            if len(vector) != 768 or not any(vector):
                fail(f"Investor embedding generation failed for profile {profile.id}")
            profile.embedding = vector
        db.commit()

    with engine.connect() as connection:
        vector_extension = connection.execute(
            text("SELECT count(*) FROM pg_extension WHERE extname = 'vector'")
        ).scalar_one()
        startup_count = connection.execute(text("SELECT count(*) FROM startups")).scalar_one()
        investor_count = connection.execute(text("SELECT count(*) FROM investors")).scalar_one()
        startup_embeddings = connection.execute(
            text("SELECT count(*) FROM startup_profiles WHERE embedding IS NOT NULL AND vector_dims(embedding)=768")
        ).scalar_one()
        investor_embeddings = connection.execute(
            text("SELECT count(*) FROM investor_profiles WHERE embedding IS NOT NULL AND vector_dims(embedding)=768")
        ).scalar_one()
    if vector_extension != 1:
        fail("pgvector extension is missing")
    if startup_embeddings != startup_count or investor_embeddings != investor_count:
        fail(
            f"required embeddings missing: startups {startup_embeddings}/{startup_count}, "
            f"investors {investor_embeddings}/{investor_count}"
        )
    print(
        "DEMO BOOTSTRAP READY: "
        f"startups={startup_count}, investors={investor_count}, "
        f"startup_embeddings={startup_embeddings}, investor_embeddings={investor_embeddings}, dims=768"
    )


if __name__ == "__main__":
    main()

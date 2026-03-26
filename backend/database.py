from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import os

# Get DATABASE_URL from environment
# Convert postgresql:// to postgresql+asyncpg:// if needed
database_url = os.getenv("DATABASE_URL")
if database_url and database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Fix for pgbouncer parameter in asyncpg
if "?pgbouncer=true" in database_url:
    database_url = database_url.replace("?pgbouncer=true", "")

if not database_url:
    # Fallback to sqlite for local dev if no DB URL is provided (but we expect one)
    database_url = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(database_url, echo=True)
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

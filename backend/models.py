from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, SmallInteger, ARRAY, UUID, text
from sqlalchemy.orm import relationship
from database import Base
import datetime
import uuid

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    credits = Column(Integer, default=50) # Initial credits
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    sessions = relationship("OracleSession", back_populates="user")

class OracleSession(Base):
    __tablename__ = "oracle_sessions"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey("user_profiles.id", ondelete="CASCADE"))
    oracle_type = Column(String) # 'iching', 'tarot', 'runes'
    question = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("UserProfile", back_populates="sessions")
    iching_result = relationship("IchingResult", back_populates="session", uselist=False)
    tarot_result = relationship("TarotResult", back_populates="session", uselist=False)
    rune_result = relationship("RuneResult", back_populates="session", uselist=False)
    interpretation = relationship("AIInterpretation", back_populates="session", uselist=False)
    chat_messages = relationship("OracleChatMessage", back_populates="session", order_by="OracleChatMessage.created_at")

class IchingResult(Base):
    __tablename__ = "iching_results"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID, ForeignKey("oracle_sessions.id", ondelete="CASCADE"))
    primary_hexagram_number = Column(SmallInteger, nullable=False)
    mutating_lines = Column(ARRAY(Boolean), nullable=False) # Array of 6 booleans
    resultant_hexagram_number = Column(SmallInteger, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("OracleSession", back_populates="iching_result")

class TarotResult(Base):
    __tablename__ = "tarot_results"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID, ForeignKey("oracle_sessions.id", ondelete="CASCADE"))
    past_card = Column(JSON, nullable=False)
    present_card = Column(JSON, nullable=False)
    future_card = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("OracleSession", back_populates="tarot_result")

class RuneResult(Base):
    __tablename__ = "rune_results"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID, ForeignKey("oracle_sessions.id", ondelete="CASCADE"))
    past_rune = Column(JSON, nullable=False)
    present_rune = Column(JSON, nullable=False)
    future_rune = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("OracleSession", back_populates="rune_result")

class AIInterpretation(Base):
    __tablename__ = "ai_interpretations"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID, ForeignKey("oracle_sessions.id", ondelete="CASCADE"))
    text = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("OracleSession", back_populates="interpretation")

class OracleChatMessage(Base):
    __tablename__ = "oracle_chat_messages"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID, ForeignKey("oracle_sessions.id", ondelete="CASCADE"), nullable=True)
    role = Column(String, nullable=False)  # 'user' or 'model'
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("OracleSession", back_populates="chat_messages")

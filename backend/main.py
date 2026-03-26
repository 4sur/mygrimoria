import os
import random
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from project root
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

from sqlalchemy import select, desc
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from auth import get_current_user, sync_user_profile
from models import OracleSession, IchingResult, TarotResult, RuneResult, AIInterpretation, OracleChatMessage
from constants import MAJOR_ARCANA, ELDER_FUTHARK

app = FastAPI(title="My Grimoria API")

# Configure CORS - allow all for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DeepSeek Client (OpenAI-compatible)
api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    # Fallback to empty string to avoid crash on startup, but log warning
    print("WARNING: DEEPSEEK_API_KEY environment variable not set")
    api_key = ""

client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
MODEL_NAME = "deepseek-chat"

class HexagramData(BaseModel):
    number: int
    name: str
    chineseName: str
    meaning: str

class IchingInterpretRequest(BaseModel):
    hexagramData: HexagramData
    lines: List[int]
    userContext: Optional[str] = None
    resultantHexagramData: Optional[HexagramData] = None

class TarotCard(BaseModel):
    name: str
    numeral: str
    meaning_upright: str

class TarotInterpretRequest(BaseModel):
    past_card: TarotCard
    present_card: TarotCard
    future_card: TarotCard
    userContext: Optional[str] = None

class Rune(BaseModel):
    name: str
    symbol: str
    meaning: str

class RuneInterpretRequest(BaseModel):
    past_rune: Rune
    present_rune: Rune
    future_rune: Rune
    userContext: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: Optional[str] = None
    parts: Optional[List[Dict[str, Any]]] = None # For backward compatibility

class ChatRequest(BaseModel):
    history: List[ChatMessage]

class SaveChatRequest(BaseModel):
    session_id: Optional[str] = None
    messages: List[Dict[str, str]]

ChatRequest.model_rebuild()

def build_user_context(profile) -> str:
    """Build user context string from profile data for AI prompts."""
    context_parts = []
    
    if profile.display_name:
        context_parts.append(f"El consultante se llama {profile.display_name}")
    if profile.birth_date:
        from datetime import date
        today = date.today()
        age = today.year - profile.birth_date.year - ((today.month, today.day) < (profile.birth_date.month, profile.birth_date.day))
        context_parts.append(f"nacido/a el {profile.birth_date.strftime('%d de %B de %Y')} (actualmente {age} años)")
    if profile.birth_place:
        context_parts.append(f"en {profile.birth_place}")
    if profile.current_place:
        if context_parts:
            context_parts[-1] += f", actualmente reside en {profile.current_place}"
        else:
            context_parts.append(f"Actualmente reside en {profile.current_place}")
    if profile.gender:
        gender_text = {"male": "varón", "female": "mujer", "other": "otro género"}.get(profile.gender, profile.gender)
        context_parts.append(f"se identifica como {gender_text}")
    if profile.prompt_context:
        context_parts.append(f"contexto adicional: {profile.prompt_context}")
    
    if context_parts:
        return ". ".join(context_parts) + "."
    return ""

@app.post("/api/iching/interpret")
async def interpret_hexagram(
    request: IchingInterpretRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Ensure user profile exists
    user_profile = await sync_user_profile(current_user, db)
    
    # Build user context for the prompt
    user_context = build_user_context(user_profile)
    
    # Create Oracle Session
    session = OracleSession(
        user_id=user_profile.id,
        oracle_type="iching",
        question=request.userContext
    )
    db.add(session)
    await db.flush() # Get session.id
    
    # Save Iching Result
    # request.lines is [9, 7, 7, 8, 8, 6] etc.
    mutating = [l in [6, 9] for l in request.lines]
    resultant_number = request.resultantHexagramData.number if request.resultantHexagramData else None
    
    iching_res = IchingResult(
        session_id=session.id,
        primary_hexagram_number=request.hexagramData.number,
        mutating_lines=mutating,
        resultant_hexagram_number=resultant_number 
    )
    db.add(iching_res)

    system_prompt = "You are a wise I Ching master. Your tone is calm, minimalist, and zen. You strictly follow I Ching principles, focusing on the movement from the primary hexagram to the resultant hexagram when changing lines occur."
    
    line_details = []
    for i, l in enumerate(request.lines):
        line_num = i + 1
        if l == 6:
            line_details.append(f"Line {line_num}: Old Yin (changing to Young Yang)")
        elif l == 9:
            line_details.append(f"Line {line_num}: Old Yang (changing to Young Yin)")
        elif l == 7:
            line_details.append(f"Line {line_num}: Young Yang (stable)")
        else:
            line_details.append(f"Line {line_num}: Young Yin (stable)")

    lines_text = "\n".join(line_details)
    
    user_prompt = f"""The user has cast a hexagram reading.
    
PRIMARY HEXAGRAM:
- Name: {request.hexagramData.name} ({request.hexagramData.chineseName})
- Number: {request.hexagramData.number}
- Meaning: {request.hexagramData.meaning}

LINES CAST:
{lines_text}
"""

    if request.resultantHexagramData:
        user_prompt += f"""
RESULTANT HEXAGRAM (The state things are moving toward):
- Name: {request.resultantHexagramData.name} ({request.resultantHexagramData.chineseName})
- Number: {request.resultantHexagramData.number}
- Meaning: {request.resultantHexagramData.meaning}
"""
    
    user_prompt += f"""
Provide a deep, zen-like interpretation of this result. Focus especially on the transition indicated by the changing lines and how the primary energy is evolving into the resultant state.
{f"\nUser's question/context: {request.userContext}" if request.userContext else ""}
{f"\nUser profile context: {user_context}" if user_context else ""}

Keep the tone calm, minimalist, and insightful. Use Markdown for formatting."""
    
    interpretation_text = ""
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            stream=False
        )
        interpretation_text = response.choices[0].message.content
    except Exception as e:
        print(f"Error: {e}")
        fallback_msg = f"*(Consulting without the digital spirit due to connection issues)*\n\nThe I Ching speaks of **{request.hexagramData.name} ({request.hexagramData.chineseName})**."
        if request.resultantHexagramData:
             fallback_msg += f" It is moving toward **{request.resultantHexagramData.name}**."
        fallback_msg += f"\n\nCore meaning: _{request.hexagramData.meaning}_.\n\nMeditate on this transition."
        interpretation_text = fallback_msg

    # Save Interpretation
    ai_interp = AIInterpretation(
        session_id=session.id,
        text=interpretation_text
    )
    db.add(ai_interp)
    await db.commit()

    return {"text": interpretation_text, "session_id": str(session.id)}

@app.post("/api/iching/chat")
async def chat_with_master(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    system_instruction = "You are a wise I Ching master. Your tone is calm, minimalist, and zen. You help users understand the wisdom of the I Ching. Keep responses concise but profound."
    
    messages = [{"role": "system", "content": system_instruction}]
    for msg in request.history:
        # Handle different frontend history formats
        content = msg.content
        if not content and hasattr(msg, 'parts') and msg.parts:
             content = msg.parts[0].get('text', '') if isinstance(msg.parts[0], dict) else getattr(msg.parts[0], 'text', '')
        
        if not content: continue

        role = "assistant" if msg.role in ["model", "assistant"] else "user"
        messages.append({"role": role, "content": content})

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            stream=False
        )
        return {"text": response.choices[0].message.content}
    except Exception as e:
        print(f"Error: {e}")
        fallback_chat = "*(The Master is meditating and cannot reply at the moment. Please reflect on your own intuition.)*"
        return {"text": fallback_chat}

@app.get("/api/tarot/draw")
async def draw_tarot_cards(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    cards = random.sample(MAJOR_ARCANA, 3)
    return {
        "past_card": cards[0],
        "present_card": cards[1],
        "future_card": cards[2]
    }

@app.post("/api/tarot/interpret")
async def interpret_tarot(
    request: TarotInterpretRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Ensure user profile exists
    user_profile = await sync_user_profile(current_user, db)
    
    # Build user context for the prompt
    user_context = build_user_context(user_profile)
    
    # Create Oracle Session
    session = OracleSession(
        user_id=user_profile.id,
        oracle_type="tarot",
        question=request.userContext
    )
    db.add(session)
    await db.flush()
    
    # Save Tarot Result
    tarot_res = TarotResult(
        session_id=session.id,
        past_card=request.past_card.model_dump(),
        present_card=request.present_card.model_dump(),
        future_card=request.future_card.model_dump()
    )
    db.add(tarot_res)

    system_prompt = "You are a wise Tarot reader with a calm, zen-like presence."
    user_prompt = f"""The user has drawn a 3-card spread (Past, Present, Future).
    
    Past: {request.past_card.name} ({request.past_card.numeral}) - {request.past_card.meaning_upright}
    Present: {request.present_card.name} ({request.present_card.numeral}) - {request.present_card.meaning_upright}
    Future: {request.future_card.name} ({request.future_card.numeral}) - {request.future_card.meaning_upright}
    
    Provide a deep, insightful interpretation of this spread. 
    Keep the tone calm, minimalist, and insightful. Focus on growth and awareness rather than rigid fortune-telling.
    Use Markdown for formatting.
    
    {f"The user's question/context: {request.userContext}" if request.userContext else ""}
    {f"User profile context: {user_context}" if user_context else ""}"""
    
    interpretation_text = ""
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            stream=False
        )
        interpretation_text = response.choices[0].message.content
    except Exception as e:
        print(f"Error: {e}")
        interpretation_text = f"*(Consulting without the digital spirit due to connection issues)*\n\n**Past:** {request.past_card.name} - {request.past_card.meaning_upright}\n\n**Present:** {request.present_card.name} - {request.present_card.meaning_upright}\n\n**Future:** {request.future_card.name} - {request.future_card.meaning_upright}\n\nThe connections between these archetypes are for you to illuminate through reflection."

    # Save Interpretation
    ai_interp = AIInterpretation(
        session_id=session.id,
        text=interpretation_text
    )
    db.add(ai_interp)
    await db.commit()

    return {"text": interpretation_text, "session_id": str(session.id)}

@app.post("/api/tarot/chat")
async def chat_with_tarot_reader(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    system_instruction = "You are a wise Tarot reader with a calm, zen-like presence. Your tone is insightful and encouraging. You help users find meaning in the cards they drew."
    
    messages = [{"role": "system", "content": system_instruction}]
    for msg in request.history:
        # Handle different frontend history formats
        content = msg.content
        if not content and hasattr(msg, 'parts') and msg.parts:
             content = msg.parts[0].get('text', '') if isinstance(msg.parts[0], dict) else getattr(msg.parts[0], 'text', '')
        
        if not content: continue

        role = "assistant" if msg.role in ["model", "assistant"] else "user"
        messages.append({"role": role, "content": content})

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            stream=False
        )
        return {"text": response.choices[0].message.content}
    except Exception as e:
        print(f"Error: {e}")
        fallback_chat = "*(The cards are still, but the reader remains silent. Refocus your energy.)*"
        return {"text": fallback_chat}

@app.post("/api/runes/interpret")
async def interpret_runes(
    request: RuneInterpretRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Ensure user profile exists
    user_profile = await sync_user_profile(current_user, db)
    
    # Build user context for the prompt
    user_context = build_user_context(user_profile)
    
    # Create Oracle Session
    session = OracleSession(
        user_id=user_profile.id,
        oracle_type="runes",
        question=request.userContext
    )
    db.add(session)
    await db.flush()
    
    # Save Rune Result
    rune_res = RuneResult(
        session_id=session.id,
        past_rune=request.past_rune.model_dump(),
        present_rune=request.present_rune.model_dump(),
        future_rune=request.future_rune.model_dump()
    )
    db.add(rune_res)

    system_prompt = "You are a wise Norse Runemaster, deeply connected to the earth, the elements, and the threads of fate woven by the Norns."
    user_prompt = f"""The user has cast a 3-rune spread (Past, Present, Future).
    
    Past: {request.past_rune.name} ({request.past_rune.symbol}) - {request.past_rune.meaning}
    Present: {request.present_rune.name} ({request.present_rune.symbol}) - {request.present_rune.meaning}
    Future: {request.future_rune.name} ({request.future_rune.symbol}) - {request.future_rune.meaning}
    
    Provide a deep, insightful interpretation of this casting. 
    Keep the tone grounded, slightly mystical, yet direct and minimalist. Focus on the cyclical nature of life, resilience, and personal truth.
    Use Markdown for formatting.
    
    {f"The user's question/context: {request.userContext}" if request.userContext else ""}
    {f"User profile context: {user_context}" if user_context else ""}"""
    
    interpretation_text = ""
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            stream=False
        )
        interpretation_text = response.choices[0].message.content
    except Exception as e:
        print(f"Error: {e}")
        interpretation_text = f"*(Consulting without the digital spirit due to connection issues)*\n\n**Past:** {request.past_rune.name} ({request.past_rune.symbol}) - {request.past_rune.meaning}\n\n**Present:** {request.present_rune.name} ({request.present_rune.symbol}) - {request.present_rune.meaning}\n\n**Future:** {request.future_rune.name} ({request.future_rune.symbol}) - {request.future_rune.meaning}\n\nThe runes are cast, the Norns have spoken. You must weave the final thread of understanding."

    # Save Interpretation
    ai_interp = AIInterpretation(
        session_id=session.id,
        text=interpretation_text
    )
    db.add(ai_interp)
    await db.commit()

    return {"text": interpretation_text, "session_id": str(session.id)}

@app.post("/api/runes/chat")
async def chat_with_runemaster(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    system_instruction = "You are a wise Norse Runemaster. Your tone is grounded, ancient, and direct. You help users understand the wisdom of the Elder Futhark runes. Keep responses concise, focusing on natural cycles, inner strength, and truth."
    
    messages = [{"role": "system", "content": system_instruction}]
    for msg in request.history:
        # Handle different frontend history formats
        content = msg.content
        if not content and hasattr(msg, 'parts') and msg.parts:
             content = msg.parts[0].get('text', '') if isinstance(msg.parts[0], dict) else getattr(msg.parts[0], 'text', '')
        
        if not content: continue

        role = "assistant" if msg.role in ["model", "assistant"] else "user"
        messages.append({"role": role, "content": content})

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            stream=False
        )
        return {"text": response.choices[0].message.content}
    except Exception as e:
        print(f"Error: {e}")
        fallback_chat = "*(The Runemaster is silent. The stones offer no further guidance at this time.)*"
        return {"text": fallback_chat}

@app.get("/api/runes/draw")
async def draw_runes(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    drawn = random.sample(ELDER_FUTHARK, 3)
    return {
        "past_rune": drawn[0],
        "present_rune": drawn[1],
        "future_rune": drawn[2]
    }

@app.post("/api/chat/save")
async def save_chat_history(
    request: SaveChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Persist the full chat exchange for an oracle session."""
    user_profile = await sync_user_profile(current_user, db)

    # Verify the session belongs to this user (if provided)
    session_id = None
    if request.session_id:
        result = await db.execute(
            select(OracleSession)
            .where(OracleSession.id == request.session_id)
            .where(OracleSession.user_id == user_profile.id)
            .options(joinedload(OracleSession.chat_messages))
        )
        session = result.unique().scalars().first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        session_id = session.id
        # Delete existing messages before re-saving (idempotent save)
        for cm in session.chat_messages:
            await db.delete(cm)
        await db.flush()

    for msg in request.messages:
        role = msg.get("role", "user")
        content = msg.get("text", "")
        if not content:
            continue
        chat_msg = OracleChatMessage(
            session_id=session_id,
            role=role,
            content=content
        )
        db.add(chat_msg)

    await db.commit()
    return {"status": "saved"}

@app.get("/api/me")
async def get_my_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile = await sync_user_profile(current_user, db)
    return profile

class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    birth_date: Optional[str] = None
    birth_place: Optional[str] = None
    current_place: Optional[str] = None
    gender: Optional[str] = None
    prompt_context: Optional[str] = None

@app.get("/api/profile")
async def get_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile = await sync_user_profile(current_user, db)
    return {
        "id": str(profile.id),
        "email": profile.email,
        "display_name": profile.display_name,
        "avatar_url": profile.avatar_url,
        "birth_date": profile.birth_date.isoformat() if profile.birth_date else None,
        "birth_place": profile.birth_place,
        "current_place": profile.current_place,
        "gender": profile.gender,
        "prompt_context": profile.prompt_context,
        "level": profile.level,
        "xp": profile.xp,
        "credits": profile.credits
    }

@app.put("/api/profile")
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    profile = await sync_user_profile(current_user, db)
    
    if request.display_name is not None:
        profile.display_name = request.display_name
    if request.avatar_url is not None:
        profile.avatar_url = request.avatar_url
    if request.birth_date is not None:
        from datetime import datetime
        profile.birth_date = datetime.strptime(request.birth_date, "%Y-%m-%d").date()
    if request.birth_place is not None:
        profile.birth_place = request.birth_place
    if request.current_place is not None:
        profile.current_place = request.current_place
    if request.gender is not None:
        profile.gender = request.gender
    if request.prompt_context is not None:
        profile.prompt_context = request.prompt_context
    
    await db.commit()
    await db.refresh(profile)
    
    return {
        "id": str(profile.id),
        "display_name": profile.display_name,
        "avatar_url": profile.avatar_url,
        "birth_date": profile.birth_date.isoformat() if profile.birth_date else None,
        "birth_place": profile.birth_place,
        "current_place": profile.current_place,
        "gender": profile.gender,
        "prompt_context": profile.prompt_context
    }

@app.get("/api/history")
async def get_oracle_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_profile = await sync_user_profile(current_user, db)
    
    # Fetch all sessions for this user, including their results and interpretation
    result = await db.execute(
        select(OracleSession)
        .where(OracleSession.user_id == user_profile.id)
        .options(
            joinedload(OracleSession.iching_result),
            joinedload(OracleSession.tarot_result),
            joinedload(OracleSession.rune_result),
            joinedload(OracleSession.interpretation),
            joinedload(OracleSession.chat_messages)
        )
        .order_by(desc(OracleSession.created_at))
    )
    
    sessions = result.unique().scalars().all()
    
    # Format the data for the frontend
    formatted_history = []
    for s in sessions:
        entry = {
            "id": str(s.id),
            "date": s.created_at.isoformat(),
            "oracle": s.oracle_type,
            "inquiry": s.question or "No context provided",
            "interpretation": s.interpretation.text if s.interpretation else "Interpretation missing",
            "details": None
        }
        
        if s.oracle_type == "iching" and s.iching_result:
            entry["details"] = {
                "primary_hex": s.iching_result.primary_hexagram_number,
                "mutating_lines": s.iching_result.mutating_lines,
                "resultant_hex": s.iching_result.resultant_hexagram_number
            }
        elif s.oracle_type == "tarot" and s.tarot_result:
            entry["details"] = {
                "past": s.tarot_result.past_card,
                "present": s.tarot_result.present_card,
                "future": s.tarot_result.future_card
            }
        elif s.oracle_type == "runes" and s.rune_result:
            entry["details"] = {
                "past": s.rune_result.past_rune,
                "present": s.rune_result.present_rune,
                "future": s.rune_result.future_rune
            }
            
        entry["chat_history"] = [
            {"role": cm.role, "text": cm.content}
            for cm in s.chat_messages
        ]
        entry["is_favorite"] = s.is_favorite
        formatted_history.append(entry)
        
    return formatted_history

@app.delete("/api/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_profile = await sync_user_profile(current_user, db)
    
    result = await db.execute(
        select(OracleSession)
        .where(OracleSession.id == session_id)
        .where(OracleSession.user_id == user_profile.id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    await db.delete(session)
    await db.commit()
    
    return {"status": "deleted"}

@app.post("/api/sessions/{session_id}/favorite")
async def toggle_favorite(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_profile = await sync_user_profile(current_user, db)
    
    result = await db.execute(
        select(OracleSession)
        .where(OracleSession.id == session_id)
        .where(OracleSession.user_id == user_profile.id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.is_favorite = not session.is_favorite
    await db.commit()
    
    return {"is_favorite": session.is_favorite}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

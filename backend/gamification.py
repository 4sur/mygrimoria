from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from models import UserProfile

LEVEL_TITLES = [
    (0, "Buscador"),
    (100, "Iniciado"),
    (250, "Vidente"),
    (450, "Intérprete"),
    (700, "Augur"),
    (1000, "Oráculo"),
    (1400, "Iluminado"),
    (1900, "Místico"),
    (2500, "Guardián del Velo"),
    (3200, "Maestro Arcano"),
    (4000, "Tejedor de Destinos"),
    (5000, "Ojo del Cosmos"),
    (6200, "Portador de Luz"),
    (7600, "Señor de los Símbolos"),
    (9200, "Custodio del Akasha"),
    (11000, "Arquitecto del Alma"),
    (13000, "Hijo del Oráculo"),
    (15500, "Eterno Visionario"),
    (18500, "Oráculo Supremo"),
    (22000, "Ascendido"),
]

XP_REWARDS = {
    "daily_login": 5,
    "streak_7_days": 25,
    "reading": 10,
    "premium_reading": 15,
    "save_reading": 5,
    "share_reading": 12,
    "first_chat_daily": 8,
}

def get_title_for_level(level: int) -> str:
    if level <= 0:
        return LEVEL_TITLES[0][1]
    if level > len(LEVEL_TITLES):
        return LEVEL_TITLES[-1][1]
    return LEVEL_TITLES[level - 1][1]

def get_level_info(xp: int) -> dict:
    current_level = 1
    current_title = "Buscador"
    next_level_xp = LEVEL_TITLES[1][0] if len(LEVEL_TITLES) > 1 else 100
    prev_level_xp = 0
    
    for i, (threshold, title) in enumerate(LEVEL_TITLES):
        if xp < threshold:
            current_level = i
            current_title = LEVEL_TITLES[i - 1][1] if i > 0 else LEVEL_TITLES[0][1]
            next_level_xp = threshold
            prev_level_xp = LEVEL_TITLES[i - 1][0] if i > 0 else 0
            break
    else:
        current_level = len(LEVEL_TITLES)
        current_title = LEVEL_TITLES[-1][1]
        next_level_xp = None
        prev_level_xp = LEVEL_TITLES[-2][0] if len(LEVEL_TITLES) > 1 else 0
    
    if next_level_xp and next_level_xp > prev_level_xp:
        progress = ((xp - prev_level_xp) / (next_level_xp - prev_level_xp)) * 100
    else:
        progress = 100
    
    return {
        "level": current_level,
        "title": current_title,
        "xp": xp,
        "xp_for_next": next_level_xp,
        "progress": min(max(progress, 0), 100)
    }

def check_level_up(old_xp: int, new_xp: int) -> Optional[dict]:
    old_info = get_level_info(old_xp)
    new_info = get_level_info(new_xp)
    
    if new_info["level"] > old_info["level"]:
        return {
            "new_level": new_info["level"],
            "new_title": new_info["title"],
            "old_level": old_info["level"],
            "old_title": old_info["title"]
        }
    return None

async def add_xp(profile: "UserProfile", amount: int, db) -> dict:
    old_xp = int(profile.xp) if profile.xp else 0
    new_xp = old_xp + amount
    
    profile.xp = new_xp
    new_level = get_level_info(new_xp)["level"]
    profile.level = new_level
    
    level_up = check_level_up(old_xp, new_xp)
    
    return {
        "xp_gained": amount,
        "total_xp": new_xp,
        "level": new_level,
        "title": get_title_for_level(new_level),
        "leveled_up": level_up is not None,
        "level_up_info": level_up
    }

import os
import urllib.request
import json
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, jwk
from jose.utils import base64url_decode
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import UserProfile
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

security = HTTPBearer()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# Cache for JWKS keys
JWKS_KEYS = None

def get_jwks_keys():
    global JWKS_KEYS
    if JWKS_KEYS is None:
        try:
            jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
            with urllib.request.urlopen(jwks_url) as response:
                JWKS_KEYS = json.loads(response.read())["keys"]
            print(f"Successfully fetched {len(JWKS_KEYS)} keys from JWKS")
        except Exception as e:
            print(f"Error fetching JWKS: {e}")
            return []
    return JWKS_KEYS

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)):
    try:
        # Debug: check header
        header = jwt.get_unverified_header(credentials.credentials)
        alg = header.get("alg")
        kid = header.get("kid")
        print(f"JWT Header: {header}")

        # Determine the key to use
        key = SUPABASE_JWT_SECRET
        if alg == "ES256":
            keys = get_jwks_keys()
            # Find the key with matching kid
            found_key = False
            for k in keys:
                if k.get("kid") == kid:
                    key = k
                    found_key = True
                    break
            if not found_key:
                print(f"Warning: No matching key found for kid {kid} in JWKS")
        
        # Decode the token from Supabase
        payload = jwt.decode(
            credentials.credentials,
            key,
            algorithms=["HS256", "ES256"],
            options={"verify_aud": True},
            audience="authenticated"
        )
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")
            
        return {"id": user_id, "email": email}
        
    except JWTError as e:
        print(f"JWT Validation Error ({alg if 'alg' in locals() else 'unknown'}): {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def sync_user_profile(user_info: dict, db: AsyncSession):
    """
    Ensures a user profile exists in our local PostgreSQL database.
    """
    user_id = user_info.get("id")
    email = user_info.get("email")
    
    result = await db.execute(select(UserProfile).where(UserProfile.id == user_id))
    user_profile = result.scalar_one_or_none()
    
    if not user_profile:
        # Check if this is the first user to make them admin
        count_res = await db.execute(select(UserProfile))
        is_first = len(count_res.scalars().all()) == 0
        
        user_profile = UserProfile(
            id=user_id, 
            email=email,
            is_admin=is_first
        )
        db.add(user_profile)
        await db.commit()
        await db.refresh(user_profile)
        
    return user_profile

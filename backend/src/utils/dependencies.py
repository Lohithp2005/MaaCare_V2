from fastapi import Request, HTTPException, status, Depends,Cookie
from fastapi.security import APIKeyCookie
import jwt
from src.utils.settings import settings
from typing import Annotated

cookie = APIKeyCookie(name="access_token", auto_error=False)

def get_current_user_email(request: Request, token :str | None = Depends(cookie)) -> str:
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing access token."
        )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email:str = payload.get("user_email")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token data."
                
            )
   
        
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again."
        )
from fastapi import APIRouter ,Depends,Response,Request,HTTPException,status
from src.users.models import User
from src.utils.settings import settings
from pydantic import EmailStr
from sqlalchemy.orm import Session
from src.utils.db import get_db
from src.users.dtos import LoginSchema, ProfileSchema, RegisterUserDTO
from src.users import controller
from src.utils.dependencies import get_current_user_email
import jwt




router = APIRouter()


        
@router.post("/register")
def create_user(User:RegisterUserDTO ,db: Session = Depends(get_db)):
    return controller.register_user(User,db)

@router.get("/allUsers")
def get_detail_users(db: Session = Depends(get_db)):
    return controller.get_detail_users(db)

@router.delete("/deleteAllUsers")
def delete_all_users(db: Session = Depends(get_db)):
    return controller.delete_all_users(db)

@router.post("/login" ,summary="User login",
    description="Authenticate a user using email and password.")
def login(body:LoginSchema,response:Response,db:Session = Depends(get_db)):
    return controller.login_user(body,response,db)

@router.post("/logout")
def logout(response:Response):
    return controller.logout_user(response)

@router.post("/profile-update")
def update_profile(
    request: Request,
    profile: ProfileSchema,
    db: Session = Depends(get_db),
    email: str = Depends(get_current_user_email)
):
    return controller.update_profile(request,profile, db,email)

@router.get("/profile-details")
def get_profile_details(request: Request, db: Session = Depends(get_db),email:str = Depends(get_current_user_email)):
    return controller.get_decrypt_details(request,db,email)
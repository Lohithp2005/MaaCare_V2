from src.users.models import User
from fastapi import Depends, HTTPException, status ,Request
from pwdlib import PasswordHash
from cryptography.fernet import Fernet
from src.utils.settings import settings
from datetime import datetime, timedelta ,timezone
import jwt


cipher = Fernet(settings.ENCRYPTION_KEY.encode())

password_hash = PasswordHash.recommended()

def get_password_hash(password):
    return password_hash.hash(password)
def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)

def register_user(user_data,db):
    
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    hashed_password = get_password_hash(user_data.password)
    new_user = User(name=user_data.name, email=user_data.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message":"Registered successfully"}

def get_detail_users(db):
    users = db.query(User).all()
    
    details_list = []
    
    for user in users:
        details = user.details if user.details else "No details provided"
        details_list.append({"name": user.name, "email": user.email, "details": details})
    return details_list

def delete_all_users(db):
    db.query(User).delete()
    db.commit()
    


def login_user(body,response,db):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email"
        )
    if not verify_password(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    exp_time = datetime.now(timezone.utc) + timedelta(hours=settings.EXPIRES_IN)    
    token = jwt.encode({"user_email":user.email,"exp": exp_time}, settings.SECRET_KEY, settings.ALGORITHM)
        
    response.set_cookie(key="access_token",value=token,httponly=True,path="/",samesite="lax",expires=exp_time)

    return {"message":"Login successful"}


    
def logout_user(response):
    response.delete_cookie(key="access_token",httponly=True,path="/",samesite="lax")
    return {"message": "Logout successful"}
   


def update_profile(request,profile, db,email):
    
   
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        print(f"Updating profile for user: {email}")
    else:
        print("user not found")
    details = (
        f"trimester: {profile.trimester},"
        f"healthDescription :{ profile.healthDescription}"
    )
    
    encrypted_details = cipher.encrypt(details.encode()).decode()
    
    user.details = encrypted_details
    db.commit()
    db.refresh(user)
    
    return {"message": "Profile updated successfully"}


        
def get_decrypt_details(request,db,email):   


    user = db.query(User).filter(User.email == email).first()

    if not user:
        return {"message": "User not found"}

    decrypted_details = cipher.decrypt(user.details.encode()).decode()

    return {
        "details": decrypted_details
    }
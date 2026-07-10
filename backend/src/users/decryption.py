from sqlalchemy.orm import Session
from src.users.models import User
from cryptography.fernet import Fernet
from src.utils.settings import settings
from src.utils.db import get_db
from fastapi import Depends

db: Session = Depends(get_db())

cipher = Fernet(settings.ENCRYPTION_KEY)

email = "Lohith@gmail.com"

user = db.query(User).filter(User.email == email).first()

if user:
    encrypted_details = user.details
    decrypted_details = cipher.decrypt(encrypted_details.encode()).decode()
    print(decrypted_details)
else:
    print("User not found")
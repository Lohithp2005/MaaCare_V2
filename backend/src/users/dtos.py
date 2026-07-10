from pydantic import BaseModel , EmailStr

class RegisterUserDTO(BaseModel):
    name: str
    email: EmailStr
    password: str 
    
    
class LoginSchema(BaseModel):
    email: EmailStr
    password:str
 
class ProfileSchema(BaseModel):
    trimester: str
    healthDescription: str
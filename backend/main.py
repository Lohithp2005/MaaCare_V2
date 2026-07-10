from fastapi import FastAPI
from src.utils.db import Base, engine
from src.users.router import router as user_router
from src.product_scanner.router import router as product_scanner_router
from src.exercise.router import router as exercise_router
from src.chat.router import router as chat_router
from src.diet.router import router as diet_router
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine) #automatically connects to DB using engine(as it contains address) and  creates all database tables defined in  ORM models and closes
app = FastAPI(title="MaaCare")

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/user")
app.include_router(product_scanner_router, prefix="/product")
app.include_router(exercise_router)
app.include_router(chat_router, prefix="/ai-agent")
app.include_router(diet_router, prefix="/diet")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, auth

app = FastAPI()

app.include_router(users.router)
app.include_router(auth.router)

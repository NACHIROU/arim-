from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, auth, shop, product, search, reviews, ai, admin, suggestions, orders, dashboard
from fastapi.openapi.utils import get_openapi
from fastapi.security import OAuth2PasswordBearer


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI()

app.include_router(users.router, tags=["Users"])
app.include_router(auth.router, tags=["Auth"])
app.include_router(shop.router, prefix="/shops", tags=["Shops"])   
app.include_router(product.router, prefix="/products", tags=["Products"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(suggestions.router, prefix="/suggestions", tags=["Suggestions"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="My Marketplace API",
        version="1.0.0",
        description="API",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", [{"BearerAuth": []}])
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/")
async def root():
    return {"message": "Welcome to the API!"}
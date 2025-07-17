from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
load_dotenv()



# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)

database = client.arimin

# Collections
users = database.get_collection("users")
shops = database.get_collection("shops")
products = database.get_collection("products")
reviews = database.get_collection("reviews")
suggestions = database.get_collection("suggestions")


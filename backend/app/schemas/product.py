from typing import Optional
from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float


class ProductCreate(ProductBase):
    shop_id: str


class ProductUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    price: Optional[float]
    image_url: Optional[str]


class ProductOut(ProductBase):
    id: str
    image_url: str
    shop_id: str

    @classmethod
    def from_mongo(cls, data: dict) -> "ProductOut":
        return cls(
            id=str(data["_id"]),
            name=data["name"],
            description=data.get("description", ""),
            price=data["price"],
            image_url=data.get("image_url", ""),
            shop_id=str(data["shop_id"]),
        )

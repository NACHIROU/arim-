from typing import Any
from bson import ObjectId


class Product:
    def __init__(
        self,
        name: str,
        description: str,
        price: float,
        image_url: str,
        shop_id: ObjectId,
        id: ObjectId = None,
    ):
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.image_url = image_url
        self.shop_id = shop_id

    @classmethod
    def from_mongo(cls, data: dict[str, Any]) -> "Product":
        return cls(
            id=data.get("_id"),
            name=data["name"],
            description=data.get("description", ""),
            price=data["price"],
            image_url=data.get("image_url", ""),
            shop_id=data["shop_id"],
        )

    def to_mongo(self) -> dict[str, Any]:
        product_dict = {
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "image_url": self.image_url,
            "shop_id": self.shop_id,
        }
        if self.id:
            product_dict["_id"] = self.id
        return product_dict

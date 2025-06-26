def shop_helper(shop: dict) -> dict:
    return {
        "id": str(shop["_id"]),
        "name": shop["name"],
        "description": shop.get("description"),
        "location": shop["location"],
        "images": shop.get("images", []),
        "owner_id": shop["owner_id"]
    }

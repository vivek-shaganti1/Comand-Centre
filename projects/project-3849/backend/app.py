from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool = False

class ClaudeService:
    def __init__(self):
        pass
    def process(self, item: Item):
        return item

app = FastAPI()
claude_service = ClaudeService()

@app.post("/items/")
async def create_item(item: Item):
    return claude_service.process(item)
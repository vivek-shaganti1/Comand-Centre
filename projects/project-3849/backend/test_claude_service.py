from app import ClaudeService
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool = False

claude_service = ClaudeService()

def test_process_item():
    item = Item(name="Test Item", price=10.99)
    result = claude_service.process(item)
    assert result.name == "Test Item"
    assert result.price == 10.99
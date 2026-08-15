import unittest
from app import app, claude
class TestApp(unittest.TestCase):
    def test_predict(self):
        data = {'input': 'test'}
        result = claude.predict(data)
        self.assertIsNotNone(result)
import unittest
from claude import Claude
class TestClaude(unittest.TestCase):
    def test_predict(self):
        data = {'input': 'test'}
        claude = Claude()
        result = claude.predict(data)
        self.assertIsNotNone(result)
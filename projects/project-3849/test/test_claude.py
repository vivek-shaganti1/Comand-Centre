import unittest
from claude import Claude

class TestClaude(unittest.TestCase):
    def test_claude_init(self):
        claude = Claude()
        self.assertIsNotNone(claude)

    def test_claude_process(self):
        claude = Claude()
        result = claude.process('test_input')
        self.assertIsNotNone(result)

import unittest
from microservice import app

class TestMicroservice(unittest.TestCase):
    def test_root(self):
        tester = app.test_client(self)
        response = tester.get('/')
        self.assertEqual(response.status_code, 200)

    def test_claude(self):
        tester = app.test_client(self)
        response = tester.get('/claude')
        self.assertEqual(response.status_code, 200)

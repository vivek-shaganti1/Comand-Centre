import unittest
from database import Database

class TestDatabase(unittest.TestCase):
    def setUp(self):
        self.db = Database(
            db_name='test_db',
            db_user='test_user',
            db_password='test_password',
            db_host='localhost',
            db_port='5432'
        )
    
    def test_connect(self):
        self.db.connect()
        self.assertIsNotNone(self.db.connection)
    
    def test_disconnect(self):
        self.db.connect()
        self.db.disconnect()
        self.assertIsNone(self.db.connection)
    
    def test_execute_query(self):
        self.db.connect()
        query = "CREATE TABLE test_table (id SERIAL PRIMARY KEY);"
        self.db.execute_query(query)
        self.db.disconnect()
    
if __name__ == '__main__':
    unittest.main()
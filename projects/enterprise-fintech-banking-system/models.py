from db_config import connect_to_db
from psycopg2 import Error

class User:
    def __init__(self, id, username, email, password):
        self.id = id
        self.username = username
        self.email = email
        self.password = password

class Account:
    def __init__(self, id, user_id, account_number, account_type, balance):
        self.id = id
        self.user_id = user_id
        self.account_number = account_number
        self.account_type = account_type
        self.balance = balance

class Transaction:
    def __init__(self, id, account_id, transaction_type, amount, timestamp):
        self.id = id
        self.account_id = account_id
        self.transaction_type = transaction_type
        self.amount = amount
        self.timestamp = timestamp
import os
import psycopg2
from psycopg2 import Error

class Database:
    def __init__(self, db_name, db_user, db_password, db_host, db_port):
        self.db_name = db_name
        self.db_user = db_user
        self.db_password = db_password
        self.db_host = db_host
        self.db_port = db_port
        self.connection = None
    
    def connect(self):
        try:
            self.connection = psycopg2.connect(
                database=self.db_name,
                user=self.db_user,
                password=self.db_password,
                host=self.db_host,
                port=self.db_port
            )
            print("Database connection was successful")
        except (Exception, Error) as error:
            print("Error while connecting to PostgreSQL", error)
    
    def disconnect(self):
        if self.connection:
            self.connection.close()
            print("PostgreSQL connection is closed")
    
    def execute_query(self, query):
        try:
            cursor = self.connection.cursor()
            cursor.execute(query)
            self.connection.commit()
            print("Query executed successfully")
        except (Exception, Error) as error:
            print("Error while executing query", error)

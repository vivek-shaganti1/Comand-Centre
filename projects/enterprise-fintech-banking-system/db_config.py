import os
import psycopg2

database_config = {
    'host': os.environ['DB_HOST'],
    'database': os.environ['DB_NAME'],
    'user': os.environ['DB_USER'],
    'password': os.environ['DB_PASSWORD']
}

def connect_to_db():
    try:
        conn = psycopg2.connect(**database_config)
        return conn
    except psycopg2.Error as e:
        print(f'Error connecting to database: {e}')
        return None
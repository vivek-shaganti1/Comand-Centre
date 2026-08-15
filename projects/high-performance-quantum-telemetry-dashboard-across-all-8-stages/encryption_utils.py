import os
from cryptography.fernet import Fernet

def encrypt_data(data):
  key = Fernet.generate_key()
  cipher_suite = Fernet(key)
  cipher_text = cipher_suite.encrypt(data.encode('utf-8'))
  return key, cipher_text
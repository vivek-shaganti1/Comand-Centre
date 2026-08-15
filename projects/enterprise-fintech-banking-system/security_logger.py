import logging

def log_security_event(event):
    logging.basicConfig(filename='security.log', level=logging.INFO)
    logging.info(event)
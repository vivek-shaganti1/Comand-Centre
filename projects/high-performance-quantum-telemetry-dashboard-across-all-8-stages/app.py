from flask import Flask, jsonify
from pymongo import MongoClient
app = Flask(__name__)
client = MongoClient('mongodb://mongo:27017/')
@app.route('/telemetry', methods=['GET'])
def get_telemetry():
    db = client['telemetry']
    collection = db['data']
    data = list(collection.find())
    return jsonify(data)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
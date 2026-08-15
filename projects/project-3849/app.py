from claude import Claude
from flask import Flask, request, jsonify
app = Flask(__name__)
claude = Claude()
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    result = claude.predict(data)
    return jsonify(result)
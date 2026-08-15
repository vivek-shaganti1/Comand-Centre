from flask import Flask, jsonify
from claude import Claude
app = Flask(__name__)
claude = Claude()

@app.route('/')
def root():
    return 'Microservice is running'

@app.route('/claude')
def claude_endpoint():
    result = claude.process('test_input')
    return jsonify({'result': result})

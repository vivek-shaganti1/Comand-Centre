from app import app, db
from app.models import Telemetry
from flask import jsonify

@app.route('/telemetry', methods=['GET'])
def get_telemetry():
    telemetry_data = Telemetry.query.all()
    output = []
    for telemetry in telemetry_data:
        telemetry_data_dict = {'id': telemetry.id, 'stage': telemetry.stage, 'data': telemetry.data}
        output.append(telemetry_data_dict)
    return jsonify({'telemetry': output})
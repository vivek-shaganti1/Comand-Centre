import unittest
from quantum_telemetry import QuantumTelemetry

class TestQuantumTelemetry(unittest.TestCase):
    def test_quantum_telemetry_data(self):
        telemetry = QuantumTelemetry()
        data = telemetry.get_quantum_telemetry_data()
        self.assertIsNotNone(data)

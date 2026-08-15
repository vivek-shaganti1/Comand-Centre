import unittest
from quantum_telemetry_data import QuantumTelemetryData

class TestQuantumTelemetryData(unittest.TestCase):
    def test_init(self):
        data = QuantumTelemetryData()
        self.assertIsNotNone(data)

def suite():
    suite = unittest.TestSuite()
    suite.addTest(unittest.makeSuite(TestQuantumTelemetryData))
    return suite

if __name__ == '__main__':
    runner = unittest.TextTestRunner()
    runner.run(suite())
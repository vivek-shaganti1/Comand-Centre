import unittest
from quantum_telemetry_dashboard import QuantumTelemetryDashboard

class TestQuantumTelemetryDashboard(unittest.TestCase):
    def test_init(self):
        dashboard = QuantumTelemetryDashboard()
        self.assertIsNotNone(dashboard)

def suite():
    suite = unittest.TestSuite()
    suite.addTest(unittest.makeSuite(TestQuantumTelemetryDashboard))
    return suite

if __name__ == '__main__':
    runner = unittest.TextTestRunner()
    runner.run(suite())
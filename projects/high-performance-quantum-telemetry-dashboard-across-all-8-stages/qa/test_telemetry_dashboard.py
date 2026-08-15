import unittest
from telemetry_dashboard import TelemetryDashboard

class TestTelemetryDashboard(unittest.TestCase):
    def test_telemetry_data(self):
        dashboard = TelemetryDashboard()
        data = dashboard.get_telemetry_data()
        self.assertIsNotNone(data)

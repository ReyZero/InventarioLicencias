import requests
import sys
import uuid
from datetime import datetime

class ITInventoryAPITester:
    def __init__(self, base_url="https://it-asset-manager-15.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_equipment_id = None
        self.test_equipment_serial = None

    def log_test_result(self, test_name, success, message=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED {message}")
        else:
            print(f"❌ {test_name} - FAILED {message}")

    def run_get_request(self, endpoint, expected_status=200):
        """Generic GET request handler"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = requests.get(url)
            success = response.status_code == expected_status
            return success, response
        except Exception as e:
            print(f"Request error: {str(e)}")
            return False, None

    def run_post_request(self, endpoint, data, expected_status=200):
        """Generic POST request handler"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = requests.post(url, json=data, headers={'Content-Type': 'application/json'})
            success = response.status_code == expected_status
            return success, response
        except Exception as e:
            print(f"Request error: {str(e)}")
            return False, None

    def run_delete_request(self, endpoint, expected_status=200):
        """Generic DELETE request handler"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = requests.delete(url)
            success = response.status_code == expected_status
            return success, response
        except Exception as e:
            print(f"Request error: {str(e)}")
            return False, None

    def test_seed_data(self):
        """Test seeding initial data"""
        success, response = self.run_post_request("seed", {})
        if success and response:
            self.log_test_result("Seed Data", True, f"Status: {response.status_code}")
        else:
            self.log_test_result("Seed Data", False, f"Status: {response.status_code if response else 'No response'}")
        return success

    def test_get_equipment(self):
        """Test getting all equipment"""
        success, response = self.run_get_request("equipment", 200)
        if success and response:
            data = response.json()
            equipment_count = len(data)
            self.log_test_result("Get Equipment", True, f"Found {equipment_count} equipment items")
            return True, data
        else:
            self.log_test_result("Get Equipment", False, f"Status: {response.status_code if response else 'No response'}")
            return False, []

    def test_get_support_history(self):
        """Test getting support history"""
        success, response = self.run_get_request("support", 200)
        if success and response:
            data = response.json()
            support_count = len(data)
            self.log_test_result("Get Support History", True, f"Found {support_count} support records")
            return True, data
        else:
            self.log_test_result("Get Support History", False, f"Status: {response.status_code if response else 'No response'}")
            return False, []

    def test_create_equipment(self):
        """Test creating new equipment"""
        self.test_equipment_serial = f"TEST{str(uuid.uuid4())[:6].upper()}"
        
        test_equipment = {
            "nombre": "Test Equipment - Notebook HP ProBook",
            "numero_serie": self.test_equipment_serial,
            "fecha_entrega": "15/08/2025",
            "jefatura": "Test Manager",
            "usuario_final": "Test User",
            "estado": "Activo"
        }

        success, response = self.run_post_request("equipment", test_equipment, 200)
        if success and response:
            data = response.json()
            self.created_equipment_id = data.get('id')
            self.log_test_result("Create Equipment", True, f"Equipment ID: {self.created_equipment_id}")
            return True
        else:
            self.log_test_result("Create Equipment", False, f"Status: {response.status_code if response else 'No response'}")
            return False

    def test_duplicate_serial_validation(self):
        """Test that duplicate serial numbers are rejected"""
        if not self.test_equipment_serial:
            self.log_test_result("Duplicate Serial Validation", False, "No test serial number available")
            return False

        test_equipment = {
            "nombre": "Duplicate Test Equipment",
            "numero_serie": self.test_equipment_serial,  # Same serial as previous test
            "fecha_entrega": "16/08/2025",
            "jefatura": "Another Manager",
            "usuario_final": "Another User",
            "estado": "Activo"
        }

        success, response = self.run_post_request("equipment", test_equipment, 400)
        if success and response:
            self.log_test_result("Duplicate Serial Validation", True, "Correctly rejected duplicate serial")
            return True
        else:
            self.log_test_result("Duplicate Serial Validation", False, f"Should have returned 400, got: {response.status_code if response else 'No response'}")
            return False

    def test_create_support_history(self):
        """Test creating support history for the test equipment"""
        if not self.test_equipment_serial:
            self.log_test_result("Create Support History", False, "No test equipment serial available")
            return False

        test_support = {
            "numero_serie": self.test_equipment_serial,
            "fecha_envio": "20/08/2025",
            "falla_reportada": "Test issue - keyboard not working",
            "estado_garantia": "En garantía",
            "resultado": "En proceso"
        }

        success, response = self.run_post_request("support", test_support, 200)
        if success and response:
            data = response.json()
            support_id = data.get('id')
            self.log_test_result("Create Support History", True, f"Support ID: {support_id}")
            return True
        else:
            self.log_test_result("Create Support History", False, f"Status: {response.status_code if response else 'No response'}")
            return False

    def test_support_nonexistent_equipment(self):
        """Test that support creation fails for non-existent equipment"""
        test_support = {
            "numero_serie": "NONEXISTENT123",
            "fecha_envio": "20/08/2025",
            "falla_reportada": "Test issue",
            "estado_garantia": "En garantía",
            "resultado": "En proceso"
        }

        success, response = self.run_post_request("support", test_support, 404)
        if success and response:
            self.log_test_result("Support Nonexistent Equipment", True, "Correctly rejected non-existent equipment")
            return True
        else:
            self.log_test_result("Support Nonexistent Equipment", False, f"Should have returned 404, got: {response.status_code if response else 'No response'}")
            return False

    def test_export_excel(self):
        """Test Excel export functionality"""
        success, response = self.run_get_request("export", 200)
        if success and response:
            # Check if response is binary (Excel file)
            content_type = response.headers.get('Content-Type', '')
            is_excel = 'spreadsheet' in content_type or len(response.content) > 1000
            if is_excel:
                self.log_test_result("Export Excel", True, f"Excel file size: {len(response.content)} bytes")
                return True
            else:
                self.log_test_result("Export Excel", False, f"Response doesn't appear to be Excel file")
                return False
        else:
            self.log_test_result("Export Excel", False, f"Status: {response.status_code if response else 'No response'}")
            return False

    def test_delete_equipment(self):
        """Test deleting the test equipment"""
        if not self.created_equipment_id:
            self.log_test_result("Delete Equipment", False, "No test equipment ID available")
            return False

        success, response = self.run_delete_request(f"equipment/{self.created_equipment_id}", 200)
        if success and response:
            self.log_test_result("Delete Equipment", True, "Successfully deleted test equipment")
            return True
        else:
            self.log_test_result("Delete Equipment", False, f"Status: {response.status_code if response else 'No response'}")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🔍 Starting IT Inventory API Tests")
        print("="*50)
        
        # Test basic data loading
        self.test_seed_data()
        
        # Test GET endpoints
        equipment_success, equipment_data = self.test_get_equipment()
        support_success, support_data = self.test_get_support_history()
        
        # Validate sample data structure if available
        if equipment_success and equipment_data:
            print(f"📊 Sample equipment found: {len(equipment_data)} items")
            if equipment_data:
                sample = equipment_data[0]
                required_fields = ['id', 'nombre', 'numero_serie', 'fecha_entrega', 'jefatura', 'usuario_final', 'estado']
                missing_fields = [field for field in required_fields if field not in sample]
                if missing_fields:
                    print(f"⚠️  Missing fields in equipment: {missing_fields}")
                else:
                    print("✅ Equipment data structure is complete")
        
        if support_success and support_data:
            print(f"📊 Sample support history found: {len(support_data)} items")
            if support_data:
                sample = support_data[0]
                required_fields = ['id', 'numero_serie', 'fecha_envio', 'falla_reportada', 'estado_garantia', 'resultado']
                missing_fields = [field for field in required_fields if field not in sample]
                if missing_fields:
                    print(f"⚠️  Missing fields in support history: {missing_fields}")
                else:
                    print("✅ Support history data structure is complete")
        
        # Test CRUD operations
        self.test_create_equipment()
        self.test_duplicate_serial_validation()
        self.test_create_support_history()
        self.test_support_nonexistent_equipment()
        
        # Test export functionality
        self.test_export_excel()
        
        # Clean up
        self.test_delete_equipment()
        
        # Print summary
        print("\n" + "="*50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"✅ Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = ITInventoryAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
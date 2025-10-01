"""
Test script for Eye Detection API
ตัวอย่างการใช้งาน API endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"📌 {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except:
        print(response.text)
    print()

def test_health():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)
    return response.json()

def test_get_users():
    """Test get all users"""
    response = requests.get(f"{BASE_URL}/users")
    print_response("Get All Users", response)

def test_get_user(label):
    """Test get specific user"""
    response = requests.get(f"{BASE_URL}/users/{label}")
    print_response(f"Get User: {label}", response)

def test_create_user():
    """Test create new user"""
    user_data = {
        "username": "Test User",
        "student_id": "99999999",
        "label": "TestUser"
    }
    response = requests.post(f"{BASE_URL}/users", json=user_data)
    print_response("Create User", response)

def test_delete_user(label):
    """Test delete user"""
    response = requests.delete(f"{BASE_URL}/users/{label}")
    print_response(f"Delete User: {label}", response)

def test_get_confidence():
    """Test get current confidence threshold"""
    response = requests.get(f"{BASE_URL}/config/confidence")
    print_response("Get Confidence Threshold", response)
    return response.json()

def test_set_confidence(value):
    """Test set confidence threshold"""
    response = requests.post(f"{BASE_URL}/config/confidence?confidence={value}")
    print_response(f"Set Confidence Threshold to {value}", response)

def test_clear_cache():
    """Test clear cache"""
    response = requests.post(f"{BASE_URL}/cache/clear")
    print_response("Clear Cache", response)

def main():
    print("\n🎯 Eye Detection API Test Suite")
    print("="*60)
    print("Testing API endpoints...\n")
    
    try:
        # 1. Health check
        health = test_health()
        
        if health['status'] != 'healthy':
            print("❌ Backend is not healthy!")
            return
        
        # 2. Get current confidence
        conf = test_get_confidence()
        current_confidence = conf['confidence_threshold']
        
        # 3. Test confidence adjustment
        print("\n🔧 Testing Confidence Threshold Adjustment...")
        test_set_confidence(0.3)   # Lower (more detections)
        test_set_confidence(0.5)   # Medium
        test_set_confidence(0.7)   # Higher (more accurate)
        test_set_confidence(current_confidence)  # Restore original
        
        # 4. Test user endpoints
        if health['database'] == 'connected':
            print("\n👥 Testing User Endpoints...")
            test_get_users()
            test_get_user("Poom")  # Replace with actual label
            
            # Optional: Create and delete test user
            # test_create_user()
            # test_delete_user("TestUser")
        else:
            print("\n⚠️  Database not connected, skipping user tests")
        
        # 5. Clear cache
        test_clear_cache()
        
        print("\n✅ All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to backend!")
        print("Make sure the backend is running:")
        print("  cd backend")
        print("  uvicorn main:app --reload")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()

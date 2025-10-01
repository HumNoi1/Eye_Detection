#!/usr/bin/env python3
"""
Test script for Eye Detection API
ทดสอบ API endpoints ต่างๆ
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def print_response(response, title):
    """Print formatted response"""
    print(f"\n{'='*50}")
    print(f"{title}")
    print(f"{'='*50}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except:
        print(f"Response: {response.text}")

def test_health_check():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print_response(response, "Health Check")

def test_create_user():
    """Test create user endpoint"""
    user_data = {
        "username": "สมชาย ใจดี",
        "student_id": "6512345678",
        "label": "person_1"
    }
    response = requests.post(
        f"{BASE_URL}/users",
        json=user_data,
        headers={"Content-Type": "application/json"}
    )
    print_response(response, "Create User")
    return response

def test_get_all_users():
    """Test get all users endpoint"""
    response = requests.get(f"{BASE_URL}/users")
    print_response(response, "Get All Users")

def test_get_user_by_label(label):
    """Test get user by label endpoint"""
    response = requests.get(f"{BASE_URL}/users/{label}")
    print_response(response, f"Get User by Label: {label}")

def test_delete_user(label):
    """Test delete user endpoint"""
    response = requests.delete(f"{BASE_URL}/users/{label}")
    print_response(response, f"Delete User: {label}")

def test_clear_cache():
    """Test clear cache endpoint"""
    response = requests.post(f"{BASE_URL}/cache/clear")
    print_response(response, "Clear Cache")

def main():
    """Main test function"""
    print("🚀 Starting API Tests...")
    print(f"Base URL: {BASE_URL}")
    
    try:
        # Test 1: Health Check
        test_health_check()
        
        # Test 2: Get all users (initial state)
        test_get_all_users()
        
        # Test 3: Create a new user
        test_create_user()
        
        # Test 4: Get all users (after creation)
        test_get_all_users()
        
        # Test 5: Get specific user
        test_get_user_by_label("Frame")
        
        # Test 6: Test caching (query same user again)
        print("\n📦 Testing cache (querying same user again)...")
        test_get_user_by_label("Frame")
        
        # Test 7: Clear cache
        test_clear_cache()
        
        # Test 8: Delete user
        test_delete_user("")

        # Test 9: Try to get deleted user (should fail)
        test_get_user_by_label("")

        print("\n✅ All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to server")
        print("Make sure the server is running: python main.py")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()

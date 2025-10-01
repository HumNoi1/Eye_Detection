#!/usr/bin/env python3
"""
Database Connection Test Script
ตรวจสอบการเชื่อมต่อ Supabase และข้อมูลใน database
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def main():
    print("=" * 60)
    print("🔍 Database Connection Test")
    print("=" * 60)
    
    # Check environment variables
    print("\n1️⃣ Checking environment variables...")
    if not SUPABASE_URL:
        print("❌ SUPABASE_URL not found in .env file")
        print("   Please create .env file from .env.example")
        return False
    else:
        print(f"✓ SUPABASE_URL: {SUPABASE_URL}")
    
    if not SUPABASE_KEY:
        print("❌ SUPABASE_KEY not found in .env file")
        print("   Please create .env file from .env.example")
        return False
    else:
        print(f"✓ SUPABASE_KEY: {SUPABASE_KEY[:20]}...{SUPABASE_KEY[-10:]}")
    
    # Try to connect
    print("\n2️⃣ Testing connection to Supabase...")
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✓ Connected to Supabase successfully")
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        return False
    
    # Query users table
    print("\n3️⃣ Querying users table...")
    try:
        response = supabase.table('users').select('*').limit(5).execute()
        
        if not response.data:
            print("⚠️  No users found in database")
            print("   Please run the SQL script in database_setup.sql to insert sample data")
            return False
        
        print(f"✓ Found {len(response.data)} users (showing first 5):")
        print("\n" + "-" * 60)
        print(f"{'Label':<15} {'Username':<25} {'Student ID':<15}")
        print("-" * 60)
        
        for user in response.data[:5]:
            label = user.get('label', 'N/A')
            username = user.get('username', 'N/A')
            student_id = user.get('student_id', 'N/A')
            print(f"{label:<15} {username:<25} {student_id:<15}")
        
        print("-" * 60)
        
    except Exception as e:
        print(f"❌ Error querying database: {e}")
        print("   Make sure the users table exists (run database_setup.sql)")
        return False
    
    # Test specific label query
    print("\n4️⃣ Testing label query...")
    try:
        test_label = "Poom"  # From your database_setup.sql
        response = supabase.table('users').select('*').eq('label', test_label).execute()
        
        if response.data and len(response.data) > 0:
            user = response.data[0]
            print(f"✓ Query by label '{test_label}' successful:")
            print(f"   Username: {user['username']}")
            print(f"   Student ID: {user['student_id']}")
        else:
            print(f"⚠️  Label '{test_label}' not found in database")
            print("   Make sure your YOLO model labels match database labels")
    except Exception as e:
        print(f"❌ Error testing label query: {e}")
        return False
    
    # Count total users
    print("\n5️⃣ Database statistics...")
    try:
        response = supabase.table('users').select('*', count='exact').execute()
        total_users = response.count if hasattr(response, 'count') else len(response.data)
        print(f"✓ Total users in database: {total_users}")
    except Exception as e:
        print(f"⚠️  Could not get count: {e}")
    
    print("\n" + "=" * 60)
    print("✅ All tests passed! Database is ready to use.")
    print("=" * 60)
    print("\n💡 Tips:")
    print("   - Make sure your YOLO model labels match the 'label' column in database")
    print("   - Labels are case-sensitive (e.g., 'Poom' != 'poom')")
    print("   - Check backend logs when running to see database queries")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

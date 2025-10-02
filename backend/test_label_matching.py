"""
Test script to verify flexible label matching
Run this to test the database query logic
"""
import asyncio
from main import get_user_by_label, get_users_by_labels_batch

async def test_label_matching():
    """Test various label formats"""
    
    test_cases = [
        "Poom",                    # Exact label match
        "65025367",                # Student ID match
        "Poom 65025367",           # Combined format (should split and match)
        "poom",                    # Case insensitive username
        "Unknown Person",          # Should not match
        "John 12345678",           # Another combined format
    ]
    
    print("=" * 60)
    print("Testing Individual Label Matching")
    print("=" * 60)
    
    for label in test_cases:
        print(f"\n🔍 Testing label: '{label}'")
        result = await get_user_by_label(label)
        if result:
            print(f"   ✅ FOUND: {result['username']} (ID: {result['student_id']}, Label: {result['label']})")
        else:
            print(f"   ❌ NOT FOUND")
    
    print("\n" + "=" * 60)
    print("Testing Batch Label Matching")
    print("=" * 60)
    
    batch_labels = [
        "Poom 65025367",
        "Unknown Person",
        "65025367",
    ]
    
    print(f"\n🔍 Batch testing labels: {batch_labels}")
    results = await get_users_by_labels_batch(batch_labels)
    
    for label, user_data in results.items():
        if user_data:
            print(f"   ✅ '{label}' -> {user_data['username']} (ID: {user_data['student_id']})")
        else:
            print(f"   ❌ '{label}' -> NOT FOUND")

if __name__ == "__main__":
    print("\n🧪 Label Matching Test")
    print("This tests the flexible label matching logic")
    print("Make sure your .env file has correct SUPABASE credentials\n")
    
    asyncio.run(test_label_matching())
    
    print("\n✅ Test completed!")

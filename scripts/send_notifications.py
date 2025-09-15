#!/usr/bin/env python3
"""
Sample notification script for the Reino Dashboard
"""

import time
from datetime import datetime

def main():
    print("📧 Starting notification service...")
    print(f"📅 Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Simulate sending notifications
    recipients = ["admin@reino.com", "manager@reino.com", "team@reino.com"]
    
    for recipient in recipients:
        print(f"📤 Sending notification to {recipient}...")
        time.sleep(0.5)  # Simulate sending time
        print(f"✅ Notification sent to {recipient}")
    
    print(f"📊 Total notifications sent: {len(recipients)}")
    print("✅ Notification service completed successfully!")

if __name__ == "__main__":
    main()

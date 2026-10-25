# Emergency Database Lockdown Protocol

In the event of suspected physical kiosk theft or malicious malware intrusion:
1. DPO executes `lock-down` CLI trigger.
2. Active DEK memory buffers are purged immediately.
3. SQLite database enters encrypted read-only quarantine state.

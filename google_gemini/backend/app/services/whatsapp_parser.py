import re
from pathlib import Path
from typing import List, Dict, Any

# Matches WhatsApp export line patterns:
# e.g., "[10/10/24, 10:15:22 AM] Sender Name: Message text"
# or "10/10/24, 10:15 AM - Sender Name: Message text"
CHAT_LINE_REGEX = re.compile(
    r'^(?:\[?(\d{1,2}/\d{1,2}/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\]?|-?)\s*(.*?):\s*(.*)$'
)

def parse_whatsapp_chat(file_path: Path) -> List[Dict[str, Any]]:
    parsed_messages = []
    if not file_path.exists():
        return parsed_messages

    with open(file_path, mode="r", encoding="utf-8", errors="ignore") as f:
        for idx, line in enumerate(f, 1):
            line_str = line.strip()
            if not line_str:
                continue
            match = CHAT_LINE_REGEX.match(line_str)
            if match:
                date_part, time_part, sender, msg = match.groups()
                parsed_messages.append({
                    "line_number": idx,
                    "date": date_part,
                    "time": time_part,
                    "sender": sender.strip(),
                    "message": msg.strip()
                })
            else:
                parsed_messages.append({
                    "line_number": idx,
                    "date": "Unknown",
                    "time": "Unknown",
                    "sender": "System / Continuation",
                    "message": line_str
                })
    return parsed_messages
